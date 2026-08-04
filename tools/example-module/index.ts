import { globSync } from 'glob';
import * as path from 'path';
import { generateExampleModule } from './generate-example-module';

/** Path to find the examples */
const examplesPath = path.join('packages', 'docs-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

// glob v9 changed three things that all matter for a checked-in generated file:
// it no longer sorts results, it treats a backslash as an escape rather than a separator,
// and it returns native separators. `windowsPathsNoEscape` makes the `path.join` pattern
// work on Windows, and `posix` keeps the paths (and therefore the sort order, and therefore
// this file's contents) identical on Windows and on Linux CI.
const exampleFiles = globSync(path.join(examplesPath, '**/*.ts'), {
    windowsPathsNoEscape: true,
    posix: true
}).sort();

generateExampleModule(exampleFiles, outputModuleFilename);
