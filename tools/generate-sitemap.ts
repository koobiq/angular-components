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
    console.info('🚀 Generating sitemap.xml');

    const paths = docsGetItems()
        .map(({ categoryId, id, hasApi }) => {
            // We should manually handle /design-tokens page, because it have different tabs structure.
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

    const routes = paths
        .map((path) => {
            return DOCS_SUPPORTED_LOCALES.map((locale) => `https://koobiq.io/${locale}/${path}`);
        })
        .flat();

    const xmlUrlElements = routes.map((url) => `\t<url>\n\t\t<loc>${url}</loc>\n\t</url>\n`).join('');

    writeFileSync(
        join(process.cwd(), 'apps/docs/src/sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrlElements}</urlset>\n`
    );

    console.info('✅ sitemap.xml has been successfully generated!');
} catch (error) {
    console.info('❌ Error occurred while generating sitemap.xml! Details:\n', error);
} finally {
    console.timeEnd(timeLabel);
}
