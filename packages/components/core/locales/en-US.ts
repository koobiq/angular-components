import { KbqLocaleStringsData } from './types';

export const enUSLocaleData = {
    a11y: {
        close: 'Close',
        save: 'Save',
        saving: 'Saving',
        saveFailed: 'Couldn’t save',
        cancel: 'Cancel',
        edit: 'Edit',
        removeAll: 'Remove all',
        remove: 'Remove',
        breadcrumbs: 'Breadcrumbs',
        expandBreadcrumbs: 'Show hidden breadcrumbs',
        previousMonth: 'Previous month',
        currentDate: 'Current date',
        nextMonth: 'Next month',
        clear: 'Clear',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        resizeColumns: 'Resize columns',
        resizePanels: 'Resize panels',
        toastRegion: 'Notifications',
        optionActions: 'Actions'
    },
    select: { hiddenItemsText: '+{{ number }}', selectAll: 'Select all' },
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
            captionTextOnlyFolder: 'Drag here or {{ browseLinkFolder }}',
            captionTextWithFolder: 'Drag here or {{ browseLink }} or {{ browseLinkFolderMixed }}',
            browseLink: 'choose file',
            browseLinkFolder: 'choose folder',
            browseLinkFolderMixed: 'folder'
        },
        multiple: {
            captionText: 'or {{ browseLink }}',
            captionTextOnlyFolder: 'or {{ browseLinkFolder }}',
            captionTextWithFolder: 'or {{ browseLink }} or {{ browseLinkFolderMixed }}',
            captionTextWhenSelected: 'Drag more or {{ browseLink }}',
            captionTextForCompactSize: 'Drag here or {{ browseLink }}',
            browseLink: 'choose files',
            browseLinkFolder: 'choose folder',
            browseLinkFolderMixed: 'folder',
            title: 'Drag here'
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
    },
    timezone: {
        searchPlaceholder: 'City or time zone'
    },
    actionsPanel: {
        closeTooltip: 'Clear'
    },
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
            saveNewFilterTooltip: 'Save as new',
            searchPlaceholder: 'Search',
            searchEmptyResult: 'Nothing found',
            saveAsNewFilter: 'Save as new',
            saveChangesHeader: 'New name',
            saveChangesButton: 'Save',
            saveAsNewHeader: 'New filter',
            saveAsNewButton: 'Save as new',
            change: 'Rename',
            resetChanges: 'Reset',
            remove: 'Delete',
            error: 'A search with this name already exists',
            errorHint: 'A filter with this name already exists',
            saveButton: 'Save',
            cancelButton: 'Cancel',
            actionsTooltip: 'Filter actions'
        },
        add: {
            tooltip: 'Add filter',
            addedAnnouncement: 'The "{{ name }}" filter was added'
        },
        refresher: {
            refresh: 'Refresh',
            settings: 'Refresh settings'
        },
        pipe: {
            clearButtonTooltip: 'Clear',
            removeButtonTooltip: 'Delete',
            applyButton: 'Apply',
            emptySearchResult: 'Nothing found',
            selectAll: 'Select all',
            noOptions: 'No options'
        },
        datePipe: {
            customPeriod: 'Custom period',
            customPeriodFrom: 'from',
            customPeriodTo: 'to',
            customPeriodErrorHint: 'The period cannot start later than it ends',
            customPeriodMinIntervalErrorHint: 'The period cannot be shorter than {{ value }}',
            customPeriodMaxIntervalErrorHint: 'The period cannot be longer than {{ value }}',
            backToPeriodSelection: 'Back'
        }
    },
    clampedText: {
        openText: 'Expand',
        closeText: 'Collapse',
        showMoreText: 'Show {exceededItemCount} more',
        moreText: 'more'
    },
    navbar: {
        toggle: {
            expand: 'Expand',
            collapse: 'Collapse'
        }
    },
    searchExpandable: {
        tooltip: 'Search',
        placeholder: 'Search'
    },
    appSwitcher: {
        searchPlaceholder: 'Search',
        searchEmptyResult: 'Nothing found',
        sitesHeader: 'Other sites',
        clearSearch: 'Clear search'
    },
    username: {
        siteLabel: 'site'
    },
    popoverConfirm: {
        confirmText: 'Are you sure you want to continue?',
        confirmButtonText: 'Yes'
    },
    timeRange: {
        title: {
            for: '',
            placeholder: 'Period'
        },
        editor: {
            from: 'from',
            to: 'to',
            apply: 'Apply',
            cancel: 'Cancel',
            rangeLabel: 'Period',
            outOfBoundsError: 'Allowed period: {{ value }}',
            allTime: 'All time',
            currentQuarter: 'This quarter',
            currentYear: 'This year',
            allTimeOption: 'All time',
            currentQuarterOption: 'This quarter',
            currentYearOption: 'This year'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: 'and',
                YEARS: `{years, plural,
                one {# year}
                other {Last # years}
            }`,
                MONTHS: `{months, plural,
                one {Last month}
                other {Last # months}
            }`,
                WEEKS: `{weeks, plural,
                one {Last week}
                other {Last # weeks}
            }`,
                DAYS: `{days, plural,
                one {Last day}
                other {Last # days}
            }`,
                HOURS: `{hours, plural,
                one {Last hour}
                other {Last # hours}
            }`,
                MINUTES: `{minutes, plural,
                one {Last minute}
                other {Last # minutes}
            }`,
                SECONDS: `{seconds, plural,
                one {Last second}
                other {Last # seconds}
            }`,
                YEARS_FRACTION: `{years} years`,
                MONTHS_FRACTION: `{months} months`
            },
            option: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: 'and',
                YEARS: `{years, plural,
                one {Last year}
                other {Last # years}
            }`,
                MONTHS: `{months, plural,
                one {Last month}
                other {Last # months}
            }`,
                WEEKS: `{weeks, plural,
                one {Last week}
                other {Last # weeks}
            }`,
                DAYS: `{days, plural,
                one {Last day}
                other {Last # days}
            }`,
                HOURS: `{hours, plural,
                one {Last hour}
                other {Last # hours}
            }`,
                MINUTES: `{minutes, plural,
                one {Last minute}
                other {Last # minutes}
            }`,
                SECONDS: `{seconds, plural,
                one {Last second}
                other {Last # seconds}
            }`,
                YEARS_FRACTION: `{years} years`,
                MONTHS_FRACTION: `{months} months`
            }
        }
    },
    notificationCenter: {
        notifications: 'Notifications',
        remove: 'Delete',
        removeAll: 'Delete all',
        doNotDisturb: 'Turn off notifications',
        showPopUpNotifications: 'Turn on notifications',
        noNotifications: 'No notifications yet',
        failedToLoadNotifications: 'Failed to load notifications.',
        repeat: 'Try again',
        loadingMore: 'Loading notifications',
        unread: 'Unread'
    }
} satisfies KbqLocaleStringsData;
