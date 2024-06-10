import chalk from 'chalk';

import { extractApiToJson } from './extraction/index.mjs';
import { generateManifest } from './manifest/index.mjs';
import { generateApiToHtml } from './rendering/index.mjs';
import { ModuleInfo } from './types/index.mjs';

const modules: ModuleInfo[] = [
    {
        /** List of CDK packages that need to be documented. */
        moduleName: 'cdk',
        exclude: ['testing']
    },
    {
        /** List of koobiq packages that need to be documented. */
        moduleName: 'components',
    }
]

export const generateApiDocs = () => {
    const taskId = 'api-docs-koobiq';

    console.log(`Starting ${chalk.blue(taskId)}...`);
    const data = extractApiToJson(modules);
    const filteredData = generateManifest(data);
    generateApiToHtml(filteredData);
    console.log(chalk.green(`Finished ${chalk.bold.green(taskId)}!`));
}

try {
    generateApiDocs();
} catch (e) {
    console.error(e);
    process.exitCode = 1;
}
