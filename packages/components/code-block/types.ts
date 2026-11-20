/**
 * Context provided to the tab link template: `$implicit` is the code block file for the current tab, and
 * `fallbackFileName` is displayed when the file has no explicit name.
 */
export type KbqTabLinkTemplateContext = { $implicit: KbqCodeBlockFile; fallbackFileName: string };

/** Code block file object. */
export type KbqCodeBlockFile = {
    /**
     * Code content.
     */
    content: string;

    /**
     * File name, which will be displayed in UI and when downloading.
     * If not provided, will be set to `KBQ_CODE_BLOCK_FALLBACK_FILE_NAME`.
     */
    filename?: string;

    /**
     * File language, required for correct syntax highlighting. It has to be registered in `languages` of
     * `KbqCodeBlockHighlightJsConfig`, unless the full bundle of highlight.js is loaded. If not provided or not
     * registered, will be set to `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE`, or to `plaintext` if that is not registered
     * either.
     *
     * See the [list of supported languages](https://github.com/highlightjs/highlight.js/blob/11-stable/SUPPORTED_LANGUAGES.md).
     */
    language?: string;

    /**
     * Link to the file, which will be opened in a new window.
     * Adds `openExternalSystem` button.
     */
    link?: string;

    /** Lines to mark: line numbers, ranges of line numbers or text to find in the content. */
    markedLines?: KbqCodeBlockLineMark[];

    /** Text to mark inside the lines. */
    markedText?: KbqCodeBlockTextMark[];
};

/**
 * Lines to mark in a code block file: a line number, a range of line numbers with both ends included, or text to find
 * in the content, which marks every line its matches reach. Lines are counted from 1, the first line of the content.
 * Text is found as `KbqCodeBlockTextMark` finds it.
 */
export type KbqCodeBlockLineMark = number | [start: number, end: number] | string | RegExp;

/**
 * Text to mark in a code block file, a string or a regular expression, every match of which is marked. A regular
 * expression with capturing groups marks only what they capture: `/"name": "(John)"/` marks `John`.
 */
export type KbqCodeBlockTextMark = string | RegExp;
