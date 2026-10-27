import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

/**
 * Checks dist/components/schematics the way `ng add` and `ng update` load it: every module is `.cjs`, every
 * `require()` and `import()` names a file of the package or a package that consumers have and resolves, and
 * every schematic of both collections has a factory that loads and a schema that parses. Whether npm packs
 * every file is checked by `check-npm-resolution`, which already packs the package.
 */

const root = resolve(import.meta.dirname, '../../..');
const packagePath = join(root, 'dist/components');
const schematicsPath = join(packagePath, 'schematics');
const require = createRequire(import.meta.url);

const failures = [];

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

const toPackagePath = (file) => relative(packagePath, file).split(sep).join('/');

const componentsManifest = readJson(join(root, 'packages/components/package.json'));

/** The non-optional peers of @koobiq/components and what the Angular CLI brings into every workspace. */
const consumerPackages = new Set([
    ...Object.keys(componentsManifest.dependencies ?? {}),
    ...Object.keys(componentsManifest.peerDependencies ?? {}).filter(
        (name) => !componentsManifest.peerDependenciesMeta?.[name]?.optional
    ),
    '@angular-devkit/schematics',
    '@angular/compiler',
    '@schematics/angular',
    'typescript'
]);

const packageName = (specifier) => specifier.split('/', specifier.startsWith('@') ? 2 : 1).join('/');

/** The string specifiers of `require()` and `import()` calls, read from the syntax tree rather than the text. */
const collectImports = (file) => {
    const imports = [];
    const visit = (node) => {
        if (ts.isCallExpression(node) && node.arguments.length > 0 && ts.isStringLiteralLike(node.arguments[0])) {
            const specifier = node.arguments[0].text;

            if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
                imports.push({ kind: 'import', specifier });
            } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
                imports.push({ kind: 'require', specifier });
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.JS));

    return imports;
};

// `import()` resolves with the ESM conditions, which Node applies to a bare specifier only relative to the
// calling module. This script resolves it from here: it shares the repository's node_modules with dist/.
const resolveImport = ({ kind, specifier }, file) =>
    kind === 'import' && !specifier.startsWith('.')
        ? import.meta.resolve(specifier)
        : createRequire(file).resolve(specifier);

const shippedFiles = readdirSync(schematicsPath, { recursive: true })
    .map((file) => join(schematicsPath, file))
    .filter((file) => statSync(file).isFile());

for (const file of shippedFiles.filter((file) => file.endsWith('.js'))) {
    failures.push(`${toPackagePath(file)}: loads as an ES module, since ng-packagr marks the package "type": "module"`);
}

for (const file of shippedFiles.filter((file) => file.endsWith('.cjs'))) {
    for (const entry of collectImports(file)) {
        const { specifier } = entry;

        if (!specifier.startsWith('.') && !isBuiltin(specifier) && !consumerPackages.has(packageName(specifier))) {
            failures.push(`${toPackagePath(file)}: '${specifier}' is not a package that consumers have`);
            continue;
        }

        try {
            resolveImport(entry, file);
        } catch {
            failures.push(`${toPackagePath(file)}: cannot resolve '${specifier}'`);
        }
    }
}

const manifestPath = join(packagePath, 'package.json');

// Built on their own, the schematics have no manifest from ng-packagr; its fields point at the same files.
const manifest = statSync(manifestPath, { throwIfNoEntry: false })
    ? readJson(manifestPath)
    : { schematics: './schematics/collection.json', 'ng-update': { migrations: './schematics/migrations.json' } };

for (const [field, collectionPath] of [
    ['schematics', manifest.schematics],
    ['ng-update.migrations', manifest['ng-update']?.migrations]
]) {
    if (!collectionPath) {
        failures.push(`package.json: no ${field}`);
        continue;
    }

    const collectionFile = join(packagePath, collectionPath);
    const collectionDir = dirname(collectionFile);
    let schematics;

    try {
        ({ schematics } = readJson(collectionFile));
    } catch (error) {
        failures.push(`${field} ${collectionPath}: ${error.message.split('\n')[0]}`);
        continue;
    }

    for (const [name, { factory, schema }] of Object.entries(schematics)) {
        const where = `${toPackagePath(collectionFile)}: ${name}`;

        if (typeof factory !== 'string') {
            failures.push(`${where} has no factory`);
            continue;
        }

        const [modulePath, exportName = 'default'] = factory.split('#');

        try {
            // A plain require(), as `ExportStringRef` of @angular-devkit/schematics loads a factory.
            if (typeof require(join(collectionDir, modulePath))[exportName] !== 'function') {
                failures.push(`${where}: the factory ${factory} is not a function`);
            }
        } catch (error) {
            failures.push(`${where}: the factory ${factory} fails to load: ${error.message.split('\n')[0]}`);
        }

        if (schema) {
            try {
                readJson(join(collectionDir, schema));
            } catch (error) {
                failures.push(`${where}: the schema ${schema} cannot be read: ${error.message.split('\n')[0]}`);
            }
        }
    }
}

if (failures.length > 0) {
    console.error([`${failures.length} problem(s) in dist/components/schematics:`, ...failures].join('\n  '));
    process.exitCode = 1;
}
