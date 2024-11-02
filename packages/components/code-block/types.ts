/** Code block file type. */
export type KbqCodeBlockFile = {
    filename: string;
    content: string;
    /**
     * File language
     *
     * @link https://highlightjs.readthedocs.io/en/stable/supported-languages.html
     */
    language: string;

    link?: string;
};

/** @deprecated Will be removed in next major release, use `KbqCodeBlockFile` instead. */
export type KbqCodeFile = KbqCodeBlockFile;
