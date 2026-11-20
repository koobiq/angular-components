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
     * Stable identifier, unique among all code files on the page. Enables links such as `#request-L3-L7`.
     * Keep it unchanged when reordering files or blocks. Defaults to `undefined` (line links disabled).
     */
    id?: string;

    /** Author highlights of whole source lines. Defaults to an empty list. */
    highlightedLines?: readonly KbqCodeBlockLineRange[];

    /** Author highlights of text fragments. Defaults to an empty list. */
    highlightedRanges?: readonly KbqCodeBlockTextRange[];

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
};

/** Inclusive range of source lines, numbered from 1. */
export type KbqCodeBlockLineRange = {
    /** First source line. */
    start: number;
    /** Last source line, included in the range. */
    end: number;
};

/** Position in the original code, using UTF-16 offsets as JavaScript strings do. */
export type KbqCodeBlockTextPosition = {
    /** Source line, numbered from 1. */
    line: number;
    /** UTF-16 offset within the line, numbered from 0. */
    offset: number;
};

/** Text fragment to emphasize, from an inclusive start to an exclusive end. */
export type KbqCodeBlockTextRange = {
    /** First included position. */
    start: KbqCodeBlockTextPosition;
    /** First excluded position. */
    end: KbqCodeBlockTextPosition;
};
