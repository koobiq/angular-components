import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
} from './types';

export const enUSLocaleData = {
    select: { hiddenItemsText: '{{ number }} more' },
    datepicker: {
        placeholder: 'yyyy-mm-dd',
        dateInput: 'yyyy-MM-dd'
    },
    timepicker: {
        placeholder: {
            full: 'hh:mm:ss',
            short: 'hh:mm'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Drag file here or {{ browseLink }}',
            browseLink: 'choose'
        },
        multiple: {
            captionText: 'Drag here or {{ browseLink }}',
            captionTextWhenSelected: 'Drag more files or {{ browseLink }}',
            captionTextForCompactSize: 'Drag files or {{ browseLink }}',
            browseLink: 'choose',
            title: 'Upload files',
            gridHeaders: {
                file: 'File',
                size: 'Size'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Enable word wrap',
        softWrapOffTooltip: 'Disable word wrap',
        downloadTooltip: 'Download',
        copiedTooltip: '✓ Copied',
        copyTooltip: 'Copy',
        viewAllText: 'Show all',
        viewLessText: 'Show less',
        openExternalSystemTooltip: 'Open in the external system'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'City or time zone'
    },
    actionsPanel: {
        closeTooltip: 'Deselect'
    } satisfies KbqActionsPanelLocaleConfiguration,
    filterBar: {
        reset: {
            buttonName: 'Reset'
        },
        search: {
            tooltip: 'Search',
            placeholder: 'Search'
        },
        filters: {
            defaultName: 'Filters',
            saveNewFilterTooltip: 'Save the new filter',
            searchPlaceholder: 'Search',
            searchEmptyResult: 'Nothing found',
            saveAsNewFilter: 'Save as new filter',
            saveChanges: 'Save changes',
            saveAsNew: 'Save as new',
            change: 'Edit',
            resetChanges: 'Reset',
            remove: 'Delete',
            name: 'Name',
            error: 'The search with such name already exists',
            errorHint: 'Could not save the filter. Try again or contact the administrator.',
            saveButton: 'Save',
            cancelButton: 'Cancel'
        },
        add: {
            tooltip: 'Add filter'
        },
        pipe: {
            clearButtonTooltip: 'Clear',
            removeButtonTooltip: 'Delete',
            applyButton: 'Apply',
            emptySearchResult: 'Nothing found',
            selectAll: 'Select all'
        },
        datePipe: {
            customPeriod: 'Custom period',
            customPeriodFrom: 'from',
            customPeriodTo: 'to',
            customPeriodErrorHint: 'The period cannot start later than it ends',
            backToPeriodSelection: 'Back to selecting the period'
        }
    },
    clampedText: {
        openText: 'Expand',
        closeText: 'Collapse'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'Leave expanded',
            collapseButton: 'Collapse'
        }
    },
    searchExpandable: {
        tooltip: 'Search',
        placeholder: 'Search'
    },
    timeRange: {
        title: {
            for: 'for'
        },
        editor: {
            from: 'from',
            to: 'to',
            apply: 'Apply',
            cancel: 'Cancel',
            rangeLabel: 'for period',
            allTime: 'for all time',
            currentQuarter: 'for the current quarter',
            currentYear: 'for the current year'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# year}
                other {last # years}
            }`,
                MONTHS: `{months, plural,
                one {last month}
                other {last # months}
            }`,
                WEEKS: `{weeks, plural,
                one {last week}
                other {last # weeks}
            }`,
                DAYS: `{days, plural,
                one {last day}
                other {last # days}
            }`,
                HOURS: `{hours, plural,
                one {last hour}
                other {last # hours}
            }`,
                MINUTES: `{minutes, plural,
                one {last minute}
                other {last # minutes}
            }`,
                SECONDS: `{seconds, plural,
                one {last second}
                other {last # seconds}
            }`,
                YEARS_FRACTION: `{years} years`,
                MONTHS_FRACTION: `{months} months`
            },
            option: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# year}
                other {last # years}
            }`,
                MONTHS: `{months, plural,
                one {last month}
                other {last # months}
            }`,
                WEEKS: `{weeks, plural,
                one {last week}
                other {last # weeks}
            }`,
                DAYS: `{days, plural,
                one {last day}
                other {last # days}
            }`,
                HOURS: `{hours, plural,
                one {last hour}
                other {last # hours}
            }`,
                MINUTES: `{minutes, plural,
                one {last minute}
                other {last # minutes}
            }`,
                SECONDS: `{seconds, plural,
                one {last second}
                other {last # seconds}
            }`,
                YEARS_FRACTION: `{years} years`,
                MONTHS_FRACTION: `{months} months`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig
};
