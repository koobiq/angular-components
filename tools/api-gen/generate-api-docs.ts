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
    const { entryCollections, externalPages } = extractApiToJson(modules);
    const filteredData = generateManifest(entryCollections);
    const pageCount = generateApiPages(filteredData, externalPages);

    console.log(`Generated ${pageCount} API pages into dist/docs-pages-api`);
};

try {
    generateApiDocs();
} catch (e) {
    console.error(e);
    process.exit(1);
}
