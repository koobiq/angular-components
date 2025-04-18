import { Extractor, ExtractorConfig, ExtractorResult, IConfigFile } from '@microsoft/api-extractor';
import { JsonFile, PackageJsonLookup } from '@rushstack/node-core-library';
import chalk from 'chalk';
import * as path from 'path';

const params = process.argv[2];

const { red, green } = chalk;

let localBuild = true;

const buildConfig = JsonFile.load('tools/api-extractor/config.json');

if (params === 'onlyCheck') {
    localBuild = false;
} else if (params) {
    buildConfig.cdk = [];
    buildConfig.components = [];

    const [folder, component] = params.split('/');

    buildConfig[folder] = [component];
}

const configObjectFullPath: string = path.resolve('tools/api-extractor/api-extractor.json');
const packageJsonLookup: PackageJsonLookup = new PackageJsonLookup();
const packageJsonFullPath: string | undefined = packageJsonLookup.tryGetPackageJsonFilePathFor(configObjectFullPath);

let hasErrors: boolean = false;

function runExtractor(folder: string, component: string): ExtractorResult {
    const configObject: IConfigFile = ExtractorConfig.loadFile(configObjectFullPath);

    const mainEntryPointFilePath = configObject.mainEntryPointFilePath
        .replace('components', folder)
        .replace('button', component);
    const reportFolder = configObject!.apiReport!.reportFolder!.replace('components', folder);
    const reportFileName = configObject!.apiReport!.reportFileName!.replace('<unscopedPackageName>', component);

    configObject.mainEntryPointFilePath = mainEntryPointFilePath;
    configObject!.apiReport!.reportFolder = reportFolder;
    configObject!.apiReport!.reportFileName = reportFileName;

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        configObject,
        configObjectFullPath,
        packageJsonFullPath
    });

    return Extractor.invoke(extractorConfig, {
        localBuild,
        showVerboseMessages: true
    });
}

function logErrors(result: ExtractorResult, component: string) {
    if (result.succeeded) {
        console.error(green(`API Extractor completed successfully: ${component}`));
    } else if (result.errorCount > 0) {
        console.error(red(`API Extractor completed with ${result.errorCount} errors`));
        hasErrors = true;
    } else if (result.apiReportChanged) {
        process.exit(1);
    }
}

for (const component of buildConfig.cdk) {
    logErrors(runExtractor('cdk', component), component);
}

for (const component of buildConfig.components) {
    logErrors(runExtractor('components', component), component);
}

for (const component of buildConfig['components-experimental']) {
    logErrors(runExtractor('components-experimental', component), component);
}

process.exitCode = hasErrors ? 1 : 0;
