import { FormatterDurationTemplate } from '@koobiq/date-formatter';
// Type-only: `core/formatters` imports the locale data back, and a value import here would close the cycle.
import type { KbqSizeUnitsConfig } from '../formatters';
import { KbqDeepPartial } from '../utils';

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
    /** Form field button that clears the control value. */
    clear: string;
    /** Password form field button that reveals the password. */
    showPassword: string;
    /** Password form field button that masks the password. */
    hidePassword: string;
    /** Separator that resizes the columns of a description list. */
    resizeColumns: string;
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

/**
 * Locale configuration shared by `KbqSelectModule` and `KbqTreeModule`: `hiddenItemsText` is read by
 * `KbqSelectModule` (`kbq-select`) only, while `selectAll` is read by both `KbqSelectModule` and
 * `KbqTreeModule` (`kbq-tree-selection`, including standalone usage outside `KbqTreeSelectModule`).
 */
export type KbqSelectLocaleConfiguration = {
    /** Counter of the selected values that did not fit into the trigger. Supports the `{{ number }}` placeholder. */
    hiddenItemsText: string;
    /** Label of the "select all" master checkbox rendered by the `selectAll` input. */
    selectAll: string;
};

/** Locale configuration for `KbqAppSwitcherModule`: the strings rendered by the app-switcher popup. */
export type KbqAppSwitcherLocaleConfiguration = {
    /** Placeholder and accessible name of the search field. */
    searchPlaceholder: string;
    /** Message shown when no application matches the search query. */
    searchEmptyResult: string;
    /** Heading above the list of other sites. */
    sitesHeader: string;
    /** Accessible name of the button that clears the search field. */
    clearSearch: string;
};

/**
 * Locale configuration for `KbqDatepickerModule`.
 *
 * Only `placeholder` reaches the rendered output — see `dateInput`.
 */
export type KbqDatepickerLocaleConfiguration = {
    /** Placeholder of the date input, in the locale's own notation (e.g. `дд.мм.гггг`). */
    placeholder: string;
    /**
     * Parsing/formatting pattern for the date input.
     *
     * Never read: the input format is resolved from `KBQ_DATE_FORMATS` and the date adapter's own config,
     * not from the locale data. Optional because `es-LA` and `pt-BR` never declared it. Scheduled for
     * removal in a future major version — do not start depending on it.
     */
    dateInput?: string;
};

/** Locale configuration for `KbqTimepickerModule`. */
export type KbqTimepickerLocaleConfiguration = {
    /** Placeholders keyed by the time format rendered by the input. */
    placeholder: {
        /** Placeholder for the `HH:mm:ss` format. */
        full: string;
        /** Placeholder for the `HH:mm` format. */
        short: string;
    };
};

/** Locale configuration for `KbqTimezoneModule`. */
export type KbqTimezoneLocaleConfiguration = {
    /** Placeholder of the search field inside the timezone select. */
    searchPlaceholder: string;
};

/** Locale configuration for the `kbq-vertical-navbar` collapse toggle. */
export type KbqNavbarLocaleConfiguration = {
    toggle: {
        /** Accessible name of the toggle while the navbar is collapsed. */
        expand: string;
        /** Accessible name of the toggle while the navbar is expanded. */
        collapse: string;
    };
};

/**
 * Locale configuration for the information-carrier navbar toggle.
 *
 * No component reads this section — it is shipped for backwards compatibility and is scheduled for
 * removal in a future major version. Do not start depending on it.
 */
export type KbqNavbarIcLocaleConfiguration = {
    toggle: {
        pinButton: string;
        collapseButton: string;
    };
};

/** Locale configuration for `KbqSearchExpandableModule`. */
export type KbqSearchExpandableLocaleConfiguration = {
    /** Accessible name and tooltip of the collapsed search trigger. */
    tooltip: string;
    /** Placeholder of the expanded search field. */
    placeholder: string;
};

/** Locale configuration for `KbqNotificationCenterModule`. */
export type KbqNotificationCenterLocaleConfiguration = {
    /** Heading of the notification center. */
    notifications: string;
    /** Accessible name of a single notification's remove button. */
    remove: string;
    /** Label of the action clearing every notification at once. */
    removeAll: string;
    /** Label of the "do not disturb" switch. */
    doNotDisturb: string;
    /** Label of the "show pop-up notifications" switch. */
    showPopUpNotifications: string;
    /** Message shown when there is nothing to display. */
    noNotifications: string;
    /** Message shown when loading the notifications failed. */
    failedToLoadNotifications: string;
    /** Label of the button retrying a failed load. */
    repeat: string;
    /** Announced while the next page of notifications is loading. */
    loadingMore: string;
};

/** Locale configuration for `KbqFilterBarModule` and its pipes. */
export type KbqFilterBarLocaleConfiguration = {
    reset: {
        buttonName: string;
    };
    search: {
        tooltip: string;
        placeholder: string;
    };
    filters: {
        defaultName: string;
        saveNewFilterTooltip: string;
        searchPlaceholder: string;
        searchEmptyResult: string;
        saveAsNewFilter: string;
        saveChanges: string;
        saveAsNew: string;
        change: string;
        resetChanges: string;
        remove: string;
        error: string;
        errorHint: string;
        saveButton: string;
        cancelButton: string;
        actionsTooltip: string;
    };
    add: {
        tooltip: string;
        /** Announced after a filter is added. Supports the `{{ name }}` placeholder. */
        addedAnnouncement: string;
    };
    refresher: {
        refresh: string;
        settings: string;
    };
    pipe: {
        clearButtonTooltip: string;
        removeButtonTooltip: string;
        applyButton: string;
        emptySearchResult: string;
        selectAll: string;
    };
    datePipe: {
        customPeriod: string;
        customPeriodFrom: string;
        customPeriodTo: string;
        customPeriodErrorHint: string;
        /** Supports the `{{ value }}` placeholder. */
        customPeriodMinIntervalErrorHint: string;
        /** Supports the `{{ value }}` placeholder. */
        customPeriodMaxIntervalErrorHint: string;
        backToPeriodSelection: string;
    };
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
export type KbqNumberRoundingLocaleConfiguration = {
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
export type KbqNumberInputLocaleConfiguration = {
    /** Characters recognized as group (thousands) separators. */
    groupSeparator: string[];
    /** Character used for the decimal separator */
    fractionSeparator: string;
    /** Number of digits before applying group separators */
    startFormattingFrom?: number;
} & KbqNumberFormatOptions;

/** Locale configuration for the number formatter pipes. */
export type KbqNumberFormattersLocaleConfiguration = {
    number: {
        rounding: KbqNumberRoundingLocaleConfiguration;
        /** Present only for the locales that override the group separator of the decimal pipe. */
        decimal?: KbqNumberFormatOptions;
    };
};

/** Locale configuration for the library's inputs. */
export type KbqInputLocaleConfiguration = {
    number: KbqNumberInputLocaleConfiguration;
};

/** Locale configuration for `KbqClampedText` */
export type KbqClampedTextLocaleConfiguration = {
    openText: string;
    closeText: string;
    showMoreText: string;
    moreText: string;
};

/** Locale configuration for `KbqTimeRange` */
export type KbqTimeRangeLocaleConfiguration = {
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

export interface KbqBaseFileUploadLocaleConfiguration {
    captionText: string;
    captionTextOnlyFolder: string;
    captionTextWithFolder: string;
    browseLink: string;
    browseLinkFolder: string;
    browseLinkFolderMixed?: string;
}

export interface KbqMultipleFileUploadLocaleConfiguration extends KbqBaseFileUploadLocaleConfiguration {
    captionTextWhenSelected: string;
    captionTextForCompactSize: string;
    title: string;
}

export type KbqFileUploadLocaleConfiguration = {
    single: KbqBaseFileUploadLocaleConfiguration;
    multiple: KbqMultipleFileUploadLocaleConfiguration;
};

/**
 * The localized strings of a locale — the shape of `ruRULocaleData` and its siblings.
 *
 * Split from {@link KbqLocaleFormattersData} because the two halves live in separate files and are
 * merged into one locale entry by `KBQ_DEFAULT_LOCALE_DATA_FACTORY`.
 */
export interface KbqLocaleStringsData {
    a11y: KbqA11yLocaleConfiguration;
    select: KbqSelectLocaleConfiguration;
    datepicker: KbqDatepickerLocaleConfiguration;
    timepicker: KbqTimepickerLocaleConfiguration;
    fileUpload: KbqFileUploadLocaleConfiguration;
    codeBlock: KbqCodeBlockLocaleConfiguration;
    timezone: KbqTimezoneLocaleConfiguration;
    actionsPanel: KbqActionsPanelLocaleConfiguration;
    filterBar: KbqFilterBarLocaleConfiguration;
    clampedText: KbqClampedTextLocaleConfiguration;
    navbarIc: KbqNavbarIcLocaleConfiguration;
    navbar: KbqNavbarLocaleConfiguration;
    searchExpandable: KbqSearchExpandableLocaleConfiguration;
    appSwitcher: KbqAppSwitcherLocaleConfiguration;
    timeRange: KbqTimeRangeLocaleConfiguration;
    notificationCenter: KbqNotificationCenterLocaleConfiguration;
}

/** The number and size formatting rules of a locale — the shape of `ruRUFormattersData` and its siblings. */
export interface KbqLocaleFormattersData {
    formatters: KbqNumberFormattersLocaleConfiguration;
    input: KbqInputLocaleConfiguration;
    sizeUnits: KbqSizeUnitsConfig;
}

/**
 * Every localized string and formatting rule the library reads, keyed by section.
 *
 * This is the contract for custom locale data registered through `KBQ_LOCALE_DATA` or
 * `KbqLocaleService.addLocale()`, and the shape `KbqLocaleService.getParams()` resolves against.
 */
export interface KbqLocaleData extends KbqLocaleStringsData, KbqLocaleFormattersData {}

/** Name of a section of {@link KbqLocaleData}, as accepted by `KbqLocaleService.getParams()`. */
export type KbqLocaleSection = keyof KbqLocaleData;

/** Identifiers of the locales shipped with the library. */
export type KbqLocaleId = 'en-US' | 'es-LA' | 'pt-BR' | 'ru-RU' | 'tk-TM';

/**
 * A locale identifier: one of the shipped {@link KbqLocaleId}s, or any other string for a locale
 * registered through `KBQ_LOCALE_DATA` / `addLocale()`. The `string & {}` arm keeps the set open while
 * still offering the shipped ids as completions.
 */
export type KbqLocaleIdLike = KbqLocaleId | (string & {});

/** An entry of the locale registry, used to render locale pickers. */
export type KbqLocaleItem = {
    id: KbqLocaleIdLike;
    /** Name of the locale in that locale's own language. */
    name: string;
};

/** The resolved locale registry: every known locale keyed by id, plus the list used by locale pickers. */
export type KbqLocaleDataMap = Record<string, KbqLocaleData> & { items: KbqLocaleItem[] };

/** Locale data with every section — and every key within a section — optional. */
export type KbqPartialLocaleData = KbqDeepPartial<KbqLocaleData>;

/**
 * Shape accepted by `KBQ_LOCALE_DATA`. Each locale may be partial: `KbqLocaleService` merges what it
 * receives over the default locale, so a consumer only has to supply the strings they want to change.
 */
export interface KbqLocaleDataInput {
    items?: KbqLocaleItem[];
    [localeId: string]: KbqPartialLocaleData | KbqLocaleItem[] | undefined;
}

/** @deprecated Use {@link KbqAppSwitcherLocaleConfiguration}. */
export type KbqAppSwitcherConfiguration = KbqAppSwitcherLocaleConfiguration;

/** @deprecated Use {@link KbqClampedTextLocaleConfiguration}. */
export type KbqClampedTextLocaleConfig = KbqClampedTextLocaleConfiguration;

/** @deprecated Use {@link KbqTimeRangeLocaleConfiguration}. */
export type KbqTimeRangeLocaleConfig = KbqTimeRangeLocaleConfiguration;

/** @deprecated Use {@link KbqNumberRoundingLocaleConfiguration}. */
export type KbqNumberRoundingLocaleConfig = KbqNumberRoundingLocaleConfiguration;

/** @deprecated Use {@link KbqNumberInputLocaleConfiguration}. */
export type KbqNumberInputLocaleConfig = KbqNumberInputLocaleConfiguration;

/** @deprecated Use {@link KbqBaseFileUploadLocaleConfiguration}. */
export type KbqBaseFileUploadLocaleConfig = KbqBaseFileUploadLocaleConfiguration;

/** @deprecated Use {@link KbqMultipleFileUploadLocaleConfiguration}. */
export type KbqMultipleFileUploadLocaleConfig = KbqMultipleFileUploadLocaleConfiguration;

/** @deprecated Use {@link KbqFileUploadLocaleConfiguration}. */
export type KbqFileUploadLocaleConfig = KbqFileUploadLocaleConfiguration;
