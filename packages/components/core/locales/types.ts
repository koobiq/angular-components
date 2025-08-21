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

/** Options for overriding locale-based number formatting */
export type KbqNumberFormatOptions = {
    /** Overrides the default group separator in the formatted output */
    viewGroupSeparator?: string;
};

/** Locale configuration for `KbqNumberInput`. */
export type KbqNumberInputLocaleConfig = {
    /** Characters recognized as group (thousands) separators. */
    groupSeparator: string[];
    /** Character used for the decimal separator */
    fractionSeparator: string;
    /** Number of digits before applying group separators */
    startFormattingFrom?: number;
} & KbqNumberFormatOptions;

/** Locale configuration for `KbqClampedText` */
export type KbqClampedTextLocaleConfig = {
    openText: string;
    closeText: string;
};
