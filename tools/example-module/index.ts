import { sync as glob } from 'glob';
import * as path from 'path';
import { generateExampleModule } from './generate-example-module';

/** Path to find the examples */
const examplesPath = path.join('packages', 'docs-examples');

/** Output path of the module that is being created */
const outputModuleFilename = path.join(examplesPath, 'example-module.ts');

// tslint:disable-next-line:no-magic-numbers
generateExampleModule(glob(path.join(examplesPath, '**/*.ts')), outputModuleFilename);
