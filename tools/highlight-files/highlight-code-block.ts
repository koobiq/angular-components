const highlightJs = require('highlight.js');

const getLang = (initialLang: string): string => {
    const lang = initialLang.toLowerCase() === 'ts' ? 'typescript' : initialLang;
    return highlightJs.getLanguage(lang) ? lang : 'plaintext';
};

/**
 * Transforms a given code block into its corresponding HTML output. We do this using
 * highlight.js because it allows us to show colored code blocks in our documentation.
 */
export function highlightCodeBlock(code: string, lang: string, _: string): string {
    const language = getLang(lang);
    return highlightJs.highlight(code, { language }).value;
}
