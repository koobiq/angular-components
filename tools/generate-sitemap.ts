import { writeFileSync } from 'fs';
import { join } from 'path';
import { DOCS_SUPPORTED_LOCALES } from '../apps/docs/src/app/constants/locale';

/**
 * @TODO Should be generated automatically by `apps/docs/src/app/services/documentation-items.ts` (#DS-3286)
 */
const paths = [
    // ---------------------- Main ----------------------
    'main/installation/overview',
    'main/versioning/overview',
    'main/directory-structure/overview',
    'main/theming/overview',
    'main/typography/overview',
    'main/design-tokens/overview',
    'main/schematics/overview',

    // ---------------------- Components ----------------------
    'components/alert/overview',
    'components/alert/api',

    'components/actions-panel/overview',
    'components/actions-panel/api',

    'components/ag-grid/overview',

    'components/accordion/overview',
    'components/accordion/api',

    'components/autocomplete/overview',
    'components/autocomplete/api',

    'components/badge/overview',
    'components/badge/api',

    'components/breadcrumbs/overview',
    'components/breadcrumbs/api',

    'components/button/overview',
    'components/button/api',

    'components/button-toggle/overview',
    'components/button-toggle/api',

    'components/checkbox/overview',
    'components/checkbox/api',

    'components/code-block/overview',
    'components/code-block/api',

    'components/content-panel/overview',
    'components/content-panel/api',

    'components/core/overview',
    'components/core/api',

    'components/datepicker/overview',
    'components/datepicker/api',

    'components/divider/overview',
    'components/divider/api',

    'components/dl/overview',
    'components/dl/api',

    'components/dropdown/overview',
    'components/dropdown/api',

    'components/empty-state/overview',
    'components/empty-state/api',

    'components/icon/overview',
    'components/icon/api',

    'components/icon-item/overview',
    'components/icon-item/api',

    'components/input/overview',
    'components/input/api',

    'components/file-upload/overview',
    'components/file-upload/api',

    'components/filter-bar/overview',
    'components/filter-bar/api',

    'components/form-field/overview',
    'components/form-field/api',

    'components/experimental-form-field/overview',
    'components/experimental-form-field/api',

    'components/layout-flex/overview',
    'components/layout-flex/api',

    'components/link/overview',
    'components/link/api',

    'components/list/overview',
    'components/list/api',

    'components/loader-overlay/overview',
    'components/loader-overlay/api',

    'components/markdown/overview',
    'components/markdown/api',

    'components/modal/overview',
    'components/modal/api',

    'components/navbar/overview',
    'components/navbar/api',

    'components/overflow-items/overview',
    'components/overflow-items/api',

    'components/popover/overview',
    'components/popover/api',

    'components/progress-bar/overview',
    'components/progress-bar/api',

    'components/progress-spinner/overview',
    'components/progress-spinner/api',

    'components/radio/overview',
    'components/radio/api',

    'components/scrollbar/overview',
    'components/scrollbar/api',

    'components/select/overview',
    'components/select/api',

    'components/sidebar/overview',
    'components/sidebar/api',

    'components/sidepanel/overview',
    'components/sidepanel/api',

    'components/splitter/overview',
    'components/splitter/api',

    'components/table/overview',
    'components/table/api',

    'components/tabs/overview',
    'components/tabs/api',

    'components/tag/overview',
    'components/tag/api',

    'components/tag-autocomplete/overview',
    'components/tag-autocomplete/api',

    'components/tag-input/overview',
    'components/tag-input/api',

    'components/tag-list/overview',
    'components/tag-list/api',

    'components/textarea/overview',
    'components/textarea/api',

    'components/timepicker/overview',
    'components/timepicker/api',

    'components/timezone/overview',
    'components/timezone/api',

    'components/toast/overview',
    'components/toast/api',

    'components/toggle/overview',
    'components/toggle/api',

    'components/tooltip/overview',
    'components/tooltip/api',

    'components/top-bar/overview',
    'components/top-bar/api',

    'components/tree/overview',
    'components/tree/api',

    'components/tree-select/overview',
    'components/tree-select/api',

    // ---------------------- Other ----------------------
    'other/date-formatter/overview',
    'other/date-formatter/api',
    'other/filesize-formatter/overview',
    'other/filesize-formatter/api',
    'other/forms/overview',
    'other/forms/api',
    'other/number-formatter/overview',
    'other/number-formatter/api',
    'other/validation/overview',

    // ---------------------- CDK ----------------------
    'cdk/a11y/overview',
    'cdk/a11y/api',

    'cdk/keycodes/overview',
    'cdk/keycodes/api',

    // ---------------------- Icons ----------------------
    'icons'
];

try {
    console.info('🚀 Generating sitemap.xml');

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
}
