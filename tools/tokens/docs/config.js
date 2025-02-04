const TYPOGRAPHY_TABLE_ID = 'font-classes-table';

module.exports = {
    BASE_PATH: 'node_modules/@koobiq/design-tokens/web',
    BUILD_PATH: 'docs/guides/design-tokens/',
    LINE_SEP: '\r\n',
    DEFAULT_MARKDOWN_HEADER_LEVEL: 3,
    NO_HEADER: 'no-header',
    TYPOGRAPHY_TABLE_ID,
    TYPOGRAPHY_TABLE_PLACEHOLDER_START: `<!-- ${TYPOGRAPHY_TABLE_ID} -->`,
    TYPOGRAPHY_TABLE_PLACEHOLDER_END: `<!-- END ${TYPOGRAPHY_TABLE_ID} -->`
};
