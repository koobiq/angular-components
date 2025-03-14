import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

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
            buttonName: 'Сбросить'
        },
        search: {
            tooltip: 'Поиск',
            placeholder: 'Поиск'
        },
        filters: {
            defaultName: 'Фильтры',
            saveNewFilterTooltip: 'Сохранить новый фильтр',
            searchPlaceholder: 'Поиск',
            searchEmptyResult: 'Ничего не найдено',
            saveAsNewFilter: 'Сохранить как новый фильтр',
            saveChanges: 'Сохранить изменения',
            saveAsNew: 'Сохранить как новый',
            change: 'Изменить',
            resetChanges: 'Сбросить изменения',
            remove: 'Удалить',
            name: 'Название',
            error: 'Поиск с таким названием уже существует',
            errorHint: 'Не удалось сохранить фильтр. Попробуйте снова или сообщите администратору.',
            saveButton: 'Сохранить',
            cancelButton: 'Отмена'
        },
        add: {
            tooltip: 'Добавить фильтр'
        },
        pipe: {
            clearButtonTooltip: 'Очистить',
            removeButtonTooltip: 'Удалить',
            applyButton: 'Применить',
            emptySearchResult: 'Ничего не найдено'
        },
        datePipe: {
            customPeriod: 'Произвольный период',
            customPeriodFrom: 'с',
            customPeriodTo: 'по',
            customPeriodErrorHint: 'Начало периода не может быть позже окончания',
            backToPeriodSelection: 'Назад к выбору периода'
        }
};
