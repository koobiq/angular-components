import { writeFileSync } from 'fs';
import { join } from 'path';
import { DOCS_SUPPORTED_LOCALES } from '../apps/docs/src/app/constants/locale';
import { docsGetIndexablePagePaths } from '../apps/docs/src/app/page-paths';

const TIME_LABEL = 'Runtime';
const FILE_NAME = 'prerender-routes.txt';

console.time(TIME_LABEL);

try {
    console.info(`🚀 Generating ${FILE_NAME}`);

    const routes = DOCS_SUPPORTED_LOCALES.flatMap((locale) =>
        docsGetIndexablePagePaths().map((path) => `/${locale}${path ? `/${path}` : ''}`)
    );

    writeFileSync(join(process.cwd(), `apps/docs/src/${FILE_NAME}`), routes.join('\n') + '\n');

    console.info(`✅ ${FILE_NAME} has been successfully generated!`);
} catch (error) {
    console.info(`❌ Error occurred while generating ${FILE_NAME}! Details:\n`, error);
} finally {
    console.timeEnd(TIME_LABEL);
}
