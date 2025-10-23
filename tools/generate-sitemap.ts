import { writeFileSync } from 'fs';
import { join } from 'path';
import { DOCS_SUPPORTED_LOCALES } from '../apps/docs/src/app/constants/locale';
import { docsGetItems, DocsStructureCategoryId, DocsStructureItemTab } from '../apps/docs/src/app/structure';

const timeLabel = 'Runtime';

try {
    console.info('🚀 Generating sitemap.xml');
    console.time(timeLabel);

    const paths = docsGetItems()
        .map(({ categoryId, id, hasApi }) => {
            const _paths: string[] = [
                `${categoryId}/${id}/${DocsStructureItemTab.Overview}`
            ];

            if (hasApi) _paths.push(`${categoryId}/${id}/${DocsStructureItemTab.Api}`);

            return _paths;
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
    console.timeEnd(timeLabel);
} catch (error) {
    console.info('❌ Error occurred while generating sitemap.xml! Details:\n', error);
}
