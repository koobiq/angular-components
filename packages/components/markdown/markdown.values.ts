export const MARKDOWN_TAGS_TO_CLASS_ALIAS = [
    'a',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'li',
    'ol',
    'table',
    'tbody',
    'thead',
    'td',
    'tr',
    'ul',
    'pre',
    'code',
    'img'
];

/**
 * separating `th` and `p` to prevent it's conflict with `thead` and `pre`
 */
export const MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS = [
    'th',
    'p'
];
export const CLASS_PREFIX: string = 'kbq-markdown';
