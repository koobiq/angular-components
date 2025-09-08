import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration
} from './types';

export const ruRULocaleData = {
    select: { hiddenItemsText: 'еще {{ number }}' },
    datepicker: {
        placeholder: 'дд.мм.гггг',
        dateInput: 'dd.MM.yyyy'
    },
    timepicker: {
        placeholder: {
            full: 'чч:мм:сс',
            short: 'чч:мм'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Перетащите файл или {{ browseLink }}',
            browseLink: 'выберите'
        },
        multiple: {
            captionText: 'Перетащите сюда или {{ browseLink }}',
            captionTextWhenSelected: 'Перетащите еще или {{ browseLink }}',
            captionTextForCompactSize: 'Перетащите файлы или {{ browseLink }}',
            browseLink: 'выберите',
            title: 'Загрузите файлы',
            gridHeaders: {
                file: 'Файл',
                size: 'Размер'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Включить перенос по словам',
        softWrapOffTooltip: 'Выключить перенос по словам',
        downloadTooltip: 'Скачать',
        copiedTooltip: '✓ Скопировано',
        copyTooltip: 'Скопировать',
        viewAllText: 'Показать все',
        viewLessText: 'Свернуть',
        openExternalSystemTooltip: 'Открыть во внешней системе'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'Город или часовой пояс'
    },
    actionsPanel: {
        closeTooltip: 'Отменить выбор'
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
            emptySearchResult: 'Ничего не найдено',
            selectAll: 'Выбрать все'
        },
        datePipe: {
            customPeriod: 'Произвольный период',
            customPeriodFrom: 'с',
            customPeriodTo: 'по',
            customPeriodErrorHint: 'Начало периода не может быть позже окончания',
            backToPeriodSelection: 'Назад к выбору периода'
        }
    },
    clampedText: {
        openText: 'Развернуть',
        closeText: 'Свернуть'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'Оставить развернутым',
            collapseButton: 'Свернуть'
        }
    }
};
