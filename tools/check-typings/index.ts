/**
 * Type-checks the typings of the published packages the way a consumer with `skipLibCheck` off sees them.
 *
 * The packages are built with `stripInternal`, which drops declarations marked `@internal` from the typings
 * without checking that the rest still holds together, and the library build reads those typings with
 * `skipLibCheck` on. A class whose `ngOnInit` got stripped stops satisfying `OnInit`, a public signature can
 * name a type that is gone, and nothing else in CI notices.
 *
 * Run it after building the packages: `yarn run check-typings`.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';

const projectRoot = join(__dirname, '..', '..');

const packages: string[] = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')).release.packages;

const rootNames = packages.flatMap((name) => {
    const packageDir = join(projectRoot, 'dist', name);
    const typings = existsSync(packageDir) ? ts.sys.readDirectory(packageDir, ['.d.ts']) : [];

    if (typings.length === 0) {
        console.error(`❌ dist/${name} has no typings. Build the packages first.`);
        process.exit(1);
    }

    return typings;
});

const program = ts.createProgram(rootNames, {
    noEmit: true,
    strict: true,
    skipLibCheck: false,
    // What an Angular CLI application compiles with. Node10 resolution would accept deep imports into another
    // package's internal files that are not in its `exports`, and `@types/node` would hide leaked Node globals.
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
    esModuleInterop: true,
    // Point the imports between the packages straight at `dist`: their own package.json `exports` are not exercised.
    paths: Object.fromEntries(
        packages.flatMap((name) => [
            [`@koobiq/${name}`, [join(projectRoot, 'dist', name)]],
            [`@koobiq/${name}/*`, [join(projectRoot, 'dist', name, '*')]]
        ])
    )
});

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length > 0) {
    console.error(
        ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCanonicalFileName: (fileName) => fileName,
            getCurrentDirectory: () => projectRoot,
            getNewLine: () => '\n'
        })
    );
    console.error(
        '❌ The published typings do not type-check.\n\n' +
            'Most often a declaration marked `@internal` is gone from the typings while something shown above still\n' +
            'needs it: a public signature, an `implements` clause, a subclass. Keep that declaration in the typings\n' +
            '(`@docs-private` hides it from the docs only); the diff of the API golden files shows what disappeared.\n'
    );
    process.exit(1);
}

console.log(`✅ The published typings type-check: ${rootNames.length} files in ${packages.length} packages.`);
