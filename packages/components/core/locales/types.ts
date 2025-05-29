/** Locale configuration for `KbqCodeBlockModule`. */
export type KbqCodeBlockLocaleConfiguration = {
    softWrapOnTooltip: string;
    softWrapOffTooltip: string;

    downloadTooltip: string;

    copiedTooltip: string;
    copyTooltip: string;

    viewAllText: string;
    viewLessText: string;

    openExternalSystemTooltip: string;
};

/**
 * Locale configuration for `KbqActionsPanelModule`.
 */
export type KbqActionsPanelLocaleConfiguration = {
    closeTooltip: string;
};

/**
 * Locale configuration for `KbqNumberInput`.
 */
export type KbqNumberInputLocaleConfig = {
    groupSeparator: string[];
    fractionSeparator: string;
    startFormattingFrom?: number;
    viewGroupSeparator?: string;
};
