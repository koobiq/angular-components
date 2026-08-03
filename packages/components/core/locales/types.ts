import { FormatterDurationTemplate } from '@koobiq/date-formatter';

/**
 * Accessible names for the icon-only buttons the library renders itself.
 *
 * An icon carries no text, so without one of these a button has no accessible name at all (AXE
 * `button-name`). They are announced by assistive tech and are never displayed.
 */
export type KbqA11yLocaleConfiguration = {
    /** Close button of a modal, popover, sidepanel, content panel or notification center. */
    close: string;
    /** Confirm button of an inline edit. */
    save: string;
    /** Discard button of an inline edit. */
    cancel: string;
    /** Button removing every notification at once. */
    removeAll: string;
    /** Breadcrumbs button revealing the items hidden by overflow. */
    expandBreadcrumbs: string;
    /** Calendar button switching to the previous month. */
    previousMonth: string;
    /** Calendar button switching back to the current date. */
    currentDate: string;
    /** Calendar button switching to the next month. */
    nextMonth: string;
};

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

/** Locale configuration for `KbqAppSwitcherModule`: the strings rendered by the app-switcher popup. */
export type KbqAppSwitcherConfiguration = {
    /** Placeholder and accessible name of the search field. */
    searchPlaceholder: string;
    /** Message shown when no application matches the search query. */
    searchEmptyResult: string;
    /** Heading above the list of other sites. */
    sitesHeader: string;
    /** Accessible name of the button that clears the search field. */
    clearSearch: string;
};

/** Options for overriding locale-based number formatting */
export type KbqNumberFormatOptions = {
    /** Overrides the default group separator in the formatted output */
    viewGroupSeparator?: string;
};

/**
 * Locale configuration for number rounding used by `KbqRoundDecimalPipe`.
 *
 * Maps each rounding unit to its localized label and carries the surrounding
 * formatting options.
 * @docs-private
 */
export type KbqNumberRoundingLocaleConfig = {
    /** Separator placed between the number and its rounding unit label. */
    separator: string;
    /** Separator placed between the integer and fractional parts. */
    groupSeparator: string;
    /** Label for the thousand unit. */
    thousand: string;
    /** Label for the million unit. */
    million: string;
    /** Label for the billion unit. */
    billion: string;
    /** Label for the trillion unit (always provided). */
    trillion: string;
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
    showMoreText: string;
    moreText: string;
};

/** Locale configuration for `KbqTimeRange` */
export type KbqTimeRangeLocaleConfig = {
    title: {
        for: string;
        placeholder: string;
    };
    editor: {
        from: string;
        to: string;
        apply: string;
        cancel: string;
        rangeLabel: string;
        allTime: string;
        currentQuarter: string;
        currentYear: string;
        /** Label for the `allTime` option in the presets list, as opposed to the trigger label in `allTime` */
        allTimeOption?: string;
        /** Label for the `currentQuarter` option in the presets list, as opposed to the trigger label in `currentQuarter` */
        currentQuarterOption?: string;
        /** Label for the `currentYear` option in the presets list, as opposed to the trigger label in `currentYear` */
        currentYearOption?: string;
    };
    durationTemplate: {
        title: FormatterDurationTemplate;
        option: FormatterDurationTemplate;
    };
};

export interface KbqBaseFileUploadLocaleConfig {
    captionText: string;
    captionTextOnlyFolder: string;
    captionTextWithFolder: string;
    browseLink: string;
    browseLinkFolder: string;
    browseLinkFolderMixed?: string;
}

export interface KbqMultipleFileUploadLocaleConfig extends KbqBaseFileUploadLocaleConfig {
    captionTextWhenSelected: string;
    captionTextForCompactSize: string;
    title: string;
}

export type KbqFileUploadLocaleConfig = {
    single: KbqBaseFileUploadLocaleConfig;
    multiple: KbqMultipleFileUploadLocaleConfig;
};
