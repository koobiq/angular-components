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
     * File language, requires for correct syntax highlighting.
     * If not provided or invalid, will be set to `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE`.
     *
     * List of supported languages:
     * @link https://highlightjs.readthedocs.io/en/stable/supported-languages.html
     */
    language?: string;

    /**
     * Link to the file, which will be opened in a new window.
     * Adds `openExternalSystem` button.
     */
    link?: string;
};

/** @deprecated Will be removed in next major release, use `KbqCodeBlockFile` instead. */
export type KbqCodeFile = KbqCodeBlockFile;
