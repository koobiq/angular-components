/** Code block file type. */
export type KbqCodeBlockFile = {
    content: string;

    /**
     * File name, which will be displayed in UI and when downloading.
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

    link?: string;
};

/** @deprecated Will be removed in next major release, use `KbqCodeBlockFile` instead. */
export type KbqCodeFile = KbqCodeBlockFile;
