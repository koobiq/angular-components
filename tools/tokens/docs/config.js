const TYPOGRAPHY_TABLE_ID = 'font-classes-table';

module.exports = {
    BASE_PATH: 'node_modules/@koobiq/design-tokens/web',
    BUILD_PATH: 'apps/docs/src/app/components/design-tokens-viewers/data/',
    LINE_SEP: '\r\n',
    DEFAULT_MARKDOWN_HEADER_LEVEL: 3,
    NO_HEADER: 'no-header',
    TYPOGRAPHY_TABLE_ID,
    TYPOGRAPHY_TABLE_PLACEHOLDER_START: `<!-- DO NOT EDIT DIRECTLY ${TYPOGRAPHY_TABLE_ID} -->`,
    TYPOGRAPHY_TABLE_PLACEHOLDER_END: `<!-- DO NOT EDIT DIRECTLY ${TYPOGRAPHY_TABLE_ID} END -->`
};
