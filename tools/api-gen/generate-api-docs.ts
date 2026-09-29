import { extractApiToJson } from './extraction';
import { generateManifest } from './manifest';
import { generateApiPages } from './rendering';
import { ModuleInfo } from './types';

const modules: ModuleInfo[] = [
    {
        /** List of koobiq packages that need to be documented. */
        moduleName: 'components'
    },
    {
        moduleName: 'components-experimental'
    }
];

const generateApiDocs = () => {
    const data = extractApiToJson(modules);
    const filteredData = generateManifest(data);
    const pageCount = generateApiPages(filteredData);

    console.log(`Generated ${pageCount} API pages into dist/docs-pages-api`);
};

try {
    generateApiDocs();
} catch (e) {
    console.error(e);
    process.exit(1);
}
