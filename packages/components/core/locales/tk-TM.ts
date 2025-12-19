import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqFileUploadLocaleConfig,
    KbqTimeRangeLocaleConfig
} from './types';

export const tkTMLocaleData = {
    select: { hiddenItemsText: '+{{ number }}' },
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
            captionText: 'Faýly geçiriň ýa-da {{ browseLink }}',
            captionTextOnlyFolder: 'Faýly geçiriň ýa-da {{ browseLinkFolder }}',
            captionTextWithFolder: 'Faýly geçiriň ýa-da {{ browseLink }} ýa-da {{ browseLinkFolderMixed }}',
            browseLink: 'saýlaň',
            browseLinkFolder: 'bukja',
            browseLinkFolderMixed: 'bukja'
        },
        multiple: {
            captionText: 'Şu ýere geçiriň ýa-da {{ browseLink }}',
            captionTextOnlyFolder: 'Şu ýere geçiriň ýa-da {{ browseLinkFolder }}',
            captionTextWithFolder: 'Şu ýere geçiriň ýa-da {{ browseLink }} ýa-da {{ browseLinkFolderMixed }}',
            captionTextWhenSelected: 'Ýene geçiriň ýa-da {{ browseLink }}',
            captionTextForCompactSize: 'Faýllary geçiriň ýa-da {{ browseLink }}',
            browseLink: 'saýlaň',
            browseLinkFolder: 'bukja',
            browseLinkFolderMixed: 'bukja',
            title: 'Faýl ýükläň'
        }
    } satisfies KbqFileUploadLocaleConfig,
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
            buttonName: 'Täzeden düz'
        },
        search: {
            tooltip: 'Gözleg',
            placeholder: 'Gözleg'
        },
        filters: {
            defaultName: 'Filtrler',
            saveNewFilterTooltip: 'Täze filtri ýazdyr',
            searchPlaceholder: 'Gözleg',
            searchEmptyResult: 'Hiç zat tapylmady',
            saveAsNewFilter: 'Täze filtr hökmünde ýazdyr',
            saveChanges: 'Üýtgetmeleri ýazdyr',
            saveAsNew: 'Täze hökmünde ýazdyr',
            change: 'Düzet',
            resetChanges: 'Täzeden düz',
            remove: 'Poz',
            name: 'At',
            error: 'Şeýle atly gözleg eýýäm bar',
            errorHint: 'Filtri ýazdyryp bolmady. Täzeden synanyň ýa-da administratora ýüz tutuň.',
            saveButton: 'Ýazdyr',
            cancelButton: 'Ýatyr'
        },
        add: {
            tooltip: 'Filtr goş'
        },
        pipe: {
            clearButtonTooltip: 'Arassala',
            removeButtonTooltip: 'Ýokla',
            applyButton: 'Ulan',
            emptySearchResult: 'Hiç zat tapylmady',
            selectAll: 'Ählisini saýla'
        },
        datePipe: {
            customPeriod: 'Laýyk döwür',
            customPeriodFrom: 'başy',
            customPeriodTo: 'soňy',
            customPeriodErrorHint: 'Döwür gutarýan wagtyndan soň başlap bilmeýär',
            backToPeriodSelection: 'Döwri saýlamaga dolan'
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
    navbar: {
        toggle: {
            expand: 'Giňeltmek',
            collapse: 'Ýykmak'
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
    } satisfies KbqTimeRangeLocaleConfig,
    notificationCenter: {
        notifications: 'Duýduryşlar',
        remove: 'Aýyr',
        doNotDisturb: 'Alada etme',
        showPopUpNotifications: 'Açylýan bildirişleri görkeziň',
        noNotifications: 'Duýduryş ýok',
        failedToLoadNotifications: 'Duýduryşlary ýükläp bilmedi',
        repeat: 'Gaýtalama'
    }
};
