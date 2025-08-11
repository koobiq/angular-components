import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration
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
    } satisfies KbqClampedTextLocaleConfig
};
