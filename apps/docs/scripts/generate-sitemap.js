const { writeFileSync } = require('fs');
const { join } = require('path');

const routes = [
    // ---------------------- Main ----------------------
    'https://koobiq.io/main/installation/overview',
    'https://koobiq.io/main/versioning/overview',
    'https://koobiq.io/main/directory-structure/overview',
    'https://koobiq.io/main/component-health/overview',
    'https://koobiq.io/main/theming/overview',
    'https://koobiq.io/main/typography/overview',

    // ---------------------- Components ----------------------
    'https://koobiq.io/components/alert/overview',
    'https://koobiq.io/components/alert/api',

    'https://koobiq.io/components/accordion/overview',
    'https://koobiq.io/components/accordion/api',

    'https://koobiq.io/components/autocomplete/overview',
    'https://koobiq.io/components/autocomplete/api',

    'https://koobiq.io/components/badge/overview',
    'https://koobiq.io/components/badge/api',

    'https://koobiq.io/components/button/overview',
    'https://koobiq.io/components/button/api',

    'https://koobiq.io/components/button-toggle/overview',
    'https://koobiq.io/components/button-toggle/api',

    'https://koobiq.io/components/checkbox/overview',
    'https://koobiq.io/components/checkbox/api',

    'https://koobiq.io/components/code-block/overview',
    'https://koobiq.io/components/code-block/api',

    'https://koobiq.io/components/datepicker/overview',
    'https://koobiq.io/components/datepicker/api',

    'https://koobiq.io/components/divider/overview',
    'https://koobiq.io/components/divider/api',

    'https://koobiq.io/components/dl/overview',
    'https://koobiq.io/components/dl/api',

    'https://koobiq.io/components/dropdown/overview',
    'https://koobiq.io/components/dropdown/api',

    'https://koobiq.io/components/empty-state/overview',
    'https://koobiq.io/components/empty-state/api',

    'https://koobiq.io/components/icon/overview',
    'https://koobiq.io/components/icon/api',

    'https://koobiq.io/components/icon-item/overview',
    'https://koobiq.io/components/icon-item/api',

    'https://koobiq.io/components/input/overview',
    'https://koobiq.io/components/input/api',

    'https://koobiq.io/components/file-upload/overview',
    'https://koobiq.io/components/file-upload/api',

    'https://koobiq.io/components/experimental-form-field/overview',
    'https://koobiq.io/components/experimental-form-field/api',

    'https://koobiq.io/components/layout-flex/overview',
    'https://koobiq.io/components/layout-flex/api',

    'https://koobiq.io/components/link/overview',
    'https://koobiq.io/components/link/api',

    'https://koobiq.io/components/list/overview',
    'https://koobiq.io/components/list/api',

    'https://koobiq.io/components/loader-overlay/overview',
    'https://koobiq.io/components/loader-overlay/api',

    'https://koobiq.io/components/markdown/overview',
    'https://koobiq.io/components/markdown/api',

    'https://koobiq.io/components/modal/overview',
    'https://koobiq.io/components/modal/api',

    'https://koobiq.io/components/navbar/overview',
    'https://koobiq.io/components/navbar/api',

    'https://koobiq.io/components/popover/overview',
    'https://koobiq.io/components/popover/api',

    'https://koobiq.io/components/progress-bar/overview',
    'https://koobiq.io/components/progress-bar/api',

    'https://koobiq.io/components/progress-spinner/overview',
    'https://koobiq.io/components/progress-spinner/api',

    'https://koobiq.io/components/radio/overview',
    'https://koobiq.io/components/radio/api',

    'https://koobiq.io/components/scrollbar/overview',
    'https://koobiq.io/components/scrollbar/api',

    'https://koobiq.io/components/select/overview',
    'https://koobiq.io/components/select/api',

    'https://koobiq.io/components/sidepanel/overview',
    'https://koobiq.io/components/sidepanel/api',

    'https://koobiq.io/components/splitter/overview',
    'https://koobiq.io/components/splitter/api',

    'https://koobiq.io/components/table/overview',
    'https://koobiq.io/components/table/api',

    'https://koobiq.io/components/tabs/overview',
    'https://koobiq.io/components/tabs/api',

    'https://koobiq.io/components/tag/overview',
    'https://koobiq.io/components/tag/api',

    'https://koobiq.io/components/tag-autocomplete/overview',
    'https://koobiq.io/components/tag-autocomplete/api',

    'https://koobiq.io/components/tag-input/overview',
    'https://koobiq.io/components/tag-input/api',

    'https://koobiq.io/components/tag-list/overview',
    'https://koobiq.io/components/tag-list/api',

    'https://koobiq.io/components/textarea/overview',
    'https://koobiq.io/components/textarea/api',

    'https://koobiq.io/components/timepicker/overview',
    'https://koobiq.io/components/timepicker/api',

    'https://koobiq.io/components/timezone/overview',
    'https://koobiq.io/components/timezone/api',

    'https://koobiq.io/components/toast/overview',
    'https://koobiq.io/components/toast/api',

    'https://koobiq.io/components/toggle/overview',
    'https://koobiq.io/components/toggle/api',

    'https://koobiq.io/components/tooltip/overview',
    'https://koobiq.io/components/tooltip/api',

    'https://koobiq.io/components/tree/overview',
    'https://koobiq.io/components/tree/api',

    'https://koobiq.io/components/tree-select/overview',
    'https://koobiq.io/components/tree-select/api',

    // ---------------------- Other ----------------------
    'https://koobiq.io/other/date-formatter/overview',
    'https://koobiq.io/other/date-formatter/api',
    'https://koobiq.io/other/forms/overview',
    'https://koobiq.io/other/forms/api',
    'https://koobiq.io/other/number-formatter/overview',
    'https://koobiq.io/other/number-formatter/api',
    'https://koobiq.io/other/validation/overview',

    // ---------------------- CDK ----------------------
    'https://koobiq.io/cdk/a11y/overview',
    'https://koobiq.io/cdk/a11y/api',

    'https://koobiq.io/cdk/keycodes/overview',
    'https://koobiq.io/cdk/keycodes/api',

    // ---------------------- Icons ----------------------
    'https://koobiq.io/icons'
];

const xmlUrlElements = routes.map((url) => `\t<url>\n\t\t<loc>${url}</loc>\n\t</url>\n`).join('');

writeFileSync(
    join(process.cwd(), 'apps/docs/src/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrlElements}</urlset>\n`
);

console.info('sitemap.xml has been successfully generated!');
