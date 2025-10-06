import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
} from './types';

export const tkTMLocaleData = {
    select: { hiddenItemsText: 'ýene {{ number }}' },
    datepicker: {
        placeholder: 'gg.aa.ýý.',
        dateInput: 'gg.aa.ýý.'
    },
    timepicker: {
        placeholder: {
            full: 'ss:mm:seksek',
            short: 'ss:mm'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Faýly geçiriň ýa-da {{ browseLink }} ',
            browseLink: 'saýlaň'
        },
        multiple: {
            captionText: 'Şu ýere geçiriň ýa-da {{ browseLink }}',
            captionTextWhenSelected: 'Ýene geçiriň ýa-da {{ browseLink }}',
            captionTextForCompactSize: 'Faýllary geçiriň ýa-da {{ browseLink }}',
            browseLink: 'saýlaň',
            title: 'Faýl ýükläň',
            gridHeaders: {
                file: 'Faýl',
                size: 'Ölçegi'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Sözler boýunça geçirmäni işjeňleşdirmek',
        softWrapOffTooltip: 'Sözler boýunça geçirmäni öçürmek',
        downloadTooltip: 'Ýüklemek',
        copiedTooltip: '✓ Göçürildi',
        copyTooltip: 'Göçürmek',
        viewAllText: 'Hemmesini görkezmek',
        viewLessText: 'Ýygyrmak',
        openExternalSystemTooltip: 'Daşarky ulgamda açmak'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'Şäher ýa-da sagat guşagy'
    },
    actionsPanel: {
        closeTooltip: 'Saýlawy ýatyr'
    } satisfies KbqActionsPanelLocaleConfiguration,
    filterBar: {
        reset: {
            buttonName: 'Täzeden sazlamak'
        },
        search: {
            tooltip: 'Gözleg',
            placeholder: 'Gözleg'
        },
        filters: {
            defaultName: 'Filtrler',
            saveNewFilterTooltip: 'Täze filtri ýatda saklamak',
            searchPlaceholder: 'Gözleg',
            searchEmptyResult: 'Hiç zat tapylmady',
            saveAsNewFilter: 'Täze filtr hökmünde ýatda saklamak',
            saveChanges: 'Üýtgetmeleri ýatda saklamak',
            saveAsNew: 'Täze hökmünde ýatda saklamak',
            change: 'Üýtgetmek',
            resetChanges: 'Üýtgetmeleri täzeden sazlamak',
            remove: 'Pozmak',
            name: 'Ady',
            error: 'Beýle atly gözleg eýýäm bar',
            errorHint: 'Filtri ýatda sakladyp bolmady. Täzeden synanyşyň ýa-da administratora habar beriň.',
            saveButton: 'Ýatda saklamak',
            cancelButton: 'Ýatyrmak'
        },
        add: {
            tooltip: 'Filtr goşmak'
        },
        pipe: {
            clearButtonTooltip: 'Arassalamak',
            removeButtonTooltip: 'Pozmak',
            applyButton: 'Ulanmak',
            emptySearchResult: 'Hiç zat tapylmady',
            selectAll: 'Hemmesini saýlaň'
        },
        datePipe: {
            customPeriod: 'Erkin döwür',
            customPeriodFrom: 'şundan',
            customPeriodTo: 'şuňa',
            customPeriodErrorHint: 'Döwrüň başlangyjy gutarýan wagtyndan soň bolup bilmeýär',
            backToPeriodSelection: 'Döwür saýlamaga dolanmak'
        }
    },
    clampedText: {
        openText: 'Giňelt',
        closeText: 'Ýap'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'Rugsat giňeldildi',
            collapseButton: 'Apseykylmak'
        }
    },
    searchExpandable: {
        tooltip: 'Gözleg',
        placeholder: 'Gözleg'
    },
    appSwitcher: {
        searchPlaceholder: 'Gözleg',
        searchEmptyResult: 'Hiç zat tapylmady',
        sitesHeader: 'Beýleki saýtlar'
    },
    timeRange: {
        title: {
            for: 'soňky',
            placeholder: 'Möhleti saýla'
        },
        editor: {
            from: 'şundan',
            to: 'şuňa',
            apply: 'Ulanmak',
            cancel: 'Ýatyrmak',
            rangeLabel: 'şu döwürde',
            allTime: 'hemme döwür üçin',
            currentQuarter: 'şu çärýek üçin',
            currentYear: 'şu ýyl üçin'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# ýyl}
                other {# ýyl}
            }`,
                MONTHS: `{months, plural,
                one {aý}
                other {# aý}
            }`,
                WEEKS: `{weeks, plural,
                one {hepde}
                other {# hepde}
            }`,
                DAYS: `{days, plural,
                one {gün}
                other {# gün}
            }`,
                HOURS: `{hours, plural,
                one {sagat}
                other {# sagat}
            }`,
                MINUTES: `{minutes, plural,
                one {minut}
                other {# minut}
            }`,
                SECONDS: `{seconds, plural,
                one {sekunt}
                other {# sekunt}
            }`,
                YEARS_FRACTION: `{years} ýyl`,
                MONTHS_FRACTION: `{months} aý`
            },
            option: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# ýyl}
                other {# ýyl}
            }`,
                MONTHS: `{months, plural,
                one {aý}
                other {# aý}
            }`,
                WEEKS: `{weeks, plural,
                one {hepde}
                other {# hepde}
            }`,
                DAYS: `{days, plural,
                one {gün}
                other {# gün}
            }`,
                HOURS: `{hours, plural,
                one {sagat}
                other {# sagat}
            }`,
                MINUTES: `{minutes, plural,
                one {minut}
                other {# minut}
            }`,
                SECONDS: `{seconds, plural,
                one {sekunt}
                other {# sekunt}
            }`,
                YEARS_FRACTION: `{years} ýyl`,
                MONTHS_FRACTION: `{months} aý`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig
};
