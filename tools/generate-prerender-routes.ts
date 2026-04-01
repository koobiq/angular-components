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

const timeLabel = 'Runtime';

console.time(timeLabel);

try {
    console.info('🚀 Generating prerender-routes.txt');

    const paths = docsGetItems()
        .map(({ categoryId, id, hasApi }) => {
            // We should manually handle /design-tokens page, because it has a different tab structure.
            if (id === DocsStructureItemId.DesignTokens) {
                return Object.values(DocsStructureTokensTab).map((tab) => `${categoryId}/${id}/${tab}`);
            }

            const tabs = [`${categoryId}/${id}/${DocsStructureItemTab.Overview}`];

            if (hasApi) tabs.push(`${categoryId}/${id}/${DocsStructureItemTab.Api}`);

            return tabs;
        })
        .flat();

    // We should manually add the icons path, because it does not have any items.
    paths.push(`${DocsStructureCategoryId.Icons}`);

    const routes = DOCS_SUPPORTED_LOCALES.flatMap((locale) => [
        `/${locale}`,
        ...paths.map((path) => `/${locale}/${path}`)
    ]);

    writeFileSync(join(process.cwd(), 'apps/docs/src/prerender-routes.txt'), routes.join('\n') + '\n');

    console.info('✅ prerender-routes.txt has been successfully generated!');
} catch (error) {
    console.info('❌ Error occurred while generating prerender-routes.txt! Details:\n', error);
} finally {
    console.timeEnd(timeLabel);
}
