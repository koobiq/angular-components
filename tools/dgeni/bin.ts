/* tslint:disable:no-shadowed-variable no-unnecessary-callback-wrapper no-function-expression only-arrow-functions */
import { ReadTypeScriptModules } from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import { TsParser } from 'dgeni-packages/typescript/services/TsParser';
import { sync as globSync } from 'glob';
import { join, relative, resolve, basename } from 'path';

import { apiDocsPackage } from './docs-package';
import { EntryPointGrouper } from './processors/entry-point-grouper';


const execRootPath = process.cwd();

const projectRootDir = resolve(__dirname, '../..');
const packagePath = resolve(projectRootDir, 'packages');
const outputDirPath = resolve(projectRootDir, 'dist/docs-content/api-docs');

/** List of CDK packages that need to be documented. */
const cdkPackages = globSync(join(packagePath, 'cdk', '*/'))
    .filter((packagePath) => !packagePath.endsWith('testing/'))
    .map((packagePath) => basename(packagePath));

/** List of koobiq date adapters packages that need to be documented. */
// const koobiqMomentDateAdaptersPackages = globSync(join(packagePath, 'angular-moment-adapter', '*/'))
//     .map((packagePath) => basename(packagePath));

/** List of koobiq date adapters packages that need to be documented. */
// const koobiqLuxonDateAdaptersPackages = globSync(join(packagePath, 'angular-luxon-adapter', '*/'))
//     .map((packagePath) => basename(packagePath));

/** List of koobiq packages that need to be documented. */
const packages = globSync(join(packagePath, 'components', '*/'))
    .map((packagePath) => basename(packagePath));

export const apiDocsPackageConfig = apiDocsPackage.config(function(
    readTypeScriptModules: ReadTypeScriptModules,
    tsParser: TsParser,
    templateFinder: any,
    writeFilesProcessor: any,
    readFilesProcessor: any,
    entryPointGrouper: EntryPointGrouper
) {
    // Set the base path for the "readFilesProcessor" to the execroot. This is necessary because
    // otherwise the "writeFilesProcessor" is not able to write to the specified output path.
    readFilesProcessor.basePath = execRootPath;

    // Set the base path for parsing the TypeScript source files to the directory that includes
    // all sources. This makes it easier for custom processors (such as the `entry-point-grouper)
    // to compute entry-point paths.
    readTypeScriptModules.basePath = packagePath;

    // Initialize the "tsParser" path mappings. These will be passed to the TypeScript program
    // and therefore use the same syntax as the "paths" option in a tsconfig.
    tsParser.options.paths = {};

    cdkPackages.forEach((packageName) => {
        const entryPointPath = `cdk/${packageName}`;
        const entryPointIndexPath = `${entryPointPath}/index.ts`;

        entryPointGrouper.entryPoints.push(entryPointPath);
        tsParser.options.paths![`@koobiq/${entryPointPath}`] = [entryPointIndexPath];
    });

    packages.forEach((packageName) => {
        const entryPointPath = `components/${packageName}`;
        const entryPointIndexPath = `${entryPointPath}/index.ts`;

        entryPointGrouper.entryPoints.push(entryPointPath);
        tsParser.options.paths![`@koobiq/${entryPointPath}`] = [entryPointIndexPath];
    });

    // koobiqMomentDateAdaptersPackages.forEach((packageName) => {
    //     const entryPointPath = `angular-moment-adapter/${packageName}`;
    //     const entryPointIndexPath = `${entryPointPath}/index.ts`;
    //
    //     entryPointGrouper.entryPoints.push(entryPointPath);
    //     tsParser.options.paths![`@koobiq/${entryPointPath}`] = [entryPointIndexPath];
    // });
    //
    // koobiqLuxonDateAdaptersPackages.forEach((packageName) => {
    //     const entryPointPath = `angular-luxon-adapter/${packageName}`;
    //     const entryPointIndexPath = `${entryPointPath}/index.ts`;
    //
    //     entryPointGrouper.entryPoints.push(entryPointPath);
    //     tsParser.options.paths![`@koobiq/${entryPointPath}`] = [entryPointIndexPath];
    // });

    readTypeScriptModules.sourceFiles = [
        ...cdkPackages.map((packageName) => `./cdk/${packageName}/index.ts`),
        // ...koobiqMomentDateAdaptersPackages.map((packageName) => `./angular-moment-adapter/${packageName}/index.ts`),
        // ...koobiqLuxonDateAdaptersPackages.map((packageName) => `./angular-luxon-adapter/${packageName}/index.ts`),
        ...packages.map((packageName) => `./components/${packageName}/index.ts`)
    ];

    // Base URL for the `tsParser`. The base URL refer to the directory that includes all
    // package sources that need to be processed by Dgeni.
    tsParser.options.baseUrl = packagePath;

    // This is ensures that the Dgeni TypeScript processor is able to parse node modules such
    // as the Angular packages which might be needed for doc items. e.g. if a class implements
    // the "AfterViewInit" interface from "@angular/core". This needs to be relative to the
    // "baseUrl" that has been specified for the "tsParser" compiler options.
    tsParser.options.paths!['*'] = [relative(packagePath, 'external/npm/node_modules/*')];

    // Since our base directory is the Bazel execroot, we need to make sure that Dgeni can
    // find all templates needed to output the API docs.
    templateFinder.templateFolders = [join(execRootPath, 'tools/dgeni/templates/')];

    // The output path for files will be computed by joining the output folder with the base path
    // from the "readFilesProcessors".
    writeFilesProcessor.outputFolder = outputDirPath;
});
