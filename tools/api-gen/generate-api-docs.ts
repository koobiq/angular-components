import chalk from 'chalk';
import { extractApiToJson } from './extraction';
import { generateManifest } from './manifest';
import { generateApiToHtml } from './rendering';
import { ModuleInfo } from './types';

const modules: ModuleInfo[] = [
    {
        /** List of CDK packages that need to be documented. */
        moduleName: 'cdk',
        exclude: ['testing']
    },
    {
        /** List of koobiq packages that need to be documented. */
        moduleName: 'components'
    },
    {
        moduleName: 'components-experimental'
    }
];

export const generateApiDocs = () => {
    const taskId = 'api-docs-koobiq';
    console.log(`Starting ${chalk.blue(taskId)}...`);
    const data = extractApiToJson(modules);
    const filteredData = generateManifest(data);
    generateApiToHtml(filteredData);
    console.log(chalk.green(`Finished ${chalk.bold.green(taskId)}!`));
};

try {
    generateApiDocs();
} catch (e) {
    console.error(e);
    process.exit(1);
}
