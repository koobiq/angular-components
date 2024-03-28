export interface KbqCodeBlockConfiguration {
    softWrapOnTooltip: string;
    softWrapOffTooltip: string;

    downloadTooltip: string;

    copiedTooltip: string;
    copyTooltip: string;

    viewAllText: string;
    viewLessText: string;

    openExternalSystemTooltip: string;
}

export interface KbqCodeFile {
    filename: string;
    content: string;
    language: string;

    link?: string;
}
