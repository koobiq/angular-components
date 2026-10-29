import type { LanguageFn } from 'highlight.js';

/**
 * Languages of the code the site shows: the blocks of the pages and of the API tabs, and the sources of the examples.
 * A block in any other language shows as plain text; `tools/docs-pages/code-languages.spec.ts` checks the pages.
 */
export const DOCS_HIGHLIGHT_JS_LANGUAGES: Record<string, () => Promise<{ default: LanguageFn }>> = {
    bash: () => import('highlight.js/lib/languages/bash'),
    css: () => import('highlight.js/lib/languages/css'),
    javascript: () => import('highlight.js/lib/languages/javascript'),
    json: () => import('highlight.js/lib/languages/json'),
    scss: () => import('highlight.js/lib/languages/scss'),
    typescript: () => import('highlight.js/lib/languages/typescript'),
    // Also `html`.
    xml: () => import('highlight.js/lib/languages/xml')
};
