import { writeFileSync } from 'fs';
import { join } from 'path';
import { DOCS_SUPPORTED_LOCALES } from '../apps/docs/src/app/constants/locale';
import {
    docsGetItems,
    DocsStructureCategoryId,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from '../apps/docs/src/app/structure';

const TIME_LABEL = 'Runtime';
const FILE_NAME = 'prerender-routes.txt';

console.time(TIME_LABEL);

try {
    console.info(`🚀 Generating ${FILE_NAME}`);

    const paths = docsGetItems()
        .map(({ categoryId, id, hasApi, hasExamples }) => {
            // We should manually handle /design-tokens page, because it has a different tab structure.
            if (id === DocsStructureItemId.DesignTokens) {
                return Object.values(DocsStructureTokensTab).map((tab) => `${categoryId}/${id}/${tab}`);
            }

            const tabs = [`${categoryId}/${id}/${DocsStructureItemTab.Overview}`];

            if (hasApi) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Api}`);
            if (hasExamples) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Examples}`);

            return tabs;
        })
        .flat();

    // We should manually add the icons path, because it does not have any items.
    paths.push(`${DocsStructureCategoryId.Icons}`);

    const routes = DOCS_SUPPORTED_LOCALES.flatMap((locale) => [
        `/${locale}`,
        ...paths.map((path) => `/${locale}/${path}`)
    ]);

    writeFileSync(join(process.cwd(), `apps/docs/src/${FILE_NAME}`), routes.join('\n') + '\n');

    console.info(`✅ ${FILE_NAME} has been successfully generated!`);
} catch (error) {
    console.info(`❌ Error occurred while generating ${FILE_NAME}! Details:\n`, error);
} finally {
    console.timeEnd(TIME_LABEL);
}
