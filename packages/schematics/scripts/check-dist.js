const { execSync } = require('child_process');
const { readdirSync, readFileSync, statSync } = require('fs');
const { createRequire } = require('module');
const { join, relative, resolve, sep } = require('path');

/**
 * Checks dist/components/schematics as a consumer gets it: npm packs every file, every `require()` and
 * `import()` resolves, and every factory of collection.json and migrations.json loads and exports a function.
 */

const packagePath = resolve(__dirname, '../../../dist/components');
const schematicsPath = join(packagePath, 'schematics');

const SPECIFIER = /\b(?:require|import)\(\s*'([^']+)'\s*\)/g;

const failures = [];

const toPackagePath = (file) => relative(packagePath, file).split(sep).join('/');

const shippedFiles = readdirSync(schematicsPath, { recursive: true })
    .map((file) => join(schematicsPath, file))
    .filter((file) => statSync(file).isFile());

for (const file of shippedFiles.filter((file) => file.endsWith('.js'))) {
    const requireFromFile = createRequire(file);

    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(SPECIFIER)) {
        try {
            requireFromFile.resolve(specifier);
        } catch {
            failures.push(`${toPackagePath(file)}: cannot resolve '${specifier}'`);
        }
    }
}

for (const collection of ['collection.json', 'migrations.json']) {
    const { schematics } = JSON.parse(readFileSync(join(schematicsPath, collection), 'utf8'));

    for (const [name, { factory }] of Object.entries(schematics)) {
        const [modulePath, exportName = 'default'] = factory.split('#');

        try {
            // A plain require(), as `ExportStringRef` of @angular-devkit/schematics loads a factory.
            if (typeof require(join(schematicsPath, modulePath))[exportName] !== 'function') {
                failures.push(`${collection}: the ${name} factory ${factory} is not a function`);
            }
        } catch (error) {
            failures.push(
                `${collection}: the ${name} factory ${factory} fails to load: ${error.message.split('\n')[0]}`
            );
        }
    }
}

// Built on their own, the schematics have no package manifest from ng-packagr to pack with.
if (statSync(join(packagePath, 'package.json'), { throwIfNoEntry: false })) {
    const [{ files }] = JSON.parse(
        execSync('npm pack --dry-run --json --ignore-scripts', {
            cwd: packagePath,
            maxBuffer: 256 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore']
        }).toString()
    );
    const packed = new Set(files.map(({ path }) => path));

    for (const file of shippedFiles.map(toPackagePath).filter((file) => !packed.has(file))) {
        failures.push(`${file}: left out by npm pack`);
    }
}

if (failures.length > 0) {
    console.error([`${failures.length} problem(s) in dist/components/schematics:`, ...failures].join('\n  '));
    process.exitCode = 1;
}
