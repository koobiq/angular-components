import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
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
    },
    searchExpandable: {
        tooltip: 'Поиск',
        placeholder: 'Поиск'
    },
    timeRange: {
        title: {
            for: 'за',
            placeholder: 'Выберите период'
        },
        editor: {
            from: 'с',
            to: 'по',
            apply: 'Применить',
            cancel: 'Отмена',
            rangeLabel: 'за период',
            allTime: 'за все время',
            currentQuarter: 'за текущий квартал',
            currentYear: 'за текущий год'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: 'и',
                YEARS: `{years, plural,
                one {# год}
                few {последние # лет}
                other {последние # лет}
            }`,
                MONTHS: `{months, plural,
                one {последний месяц}
                few {последние # месяца}
                other {последние # месяцев}
            }`,
                WEEKS: `{weeks, plural,
                one {последнюю неделю}
                few {последние # недели}
                other {последние # недель}
            }`,
                DAYS: `{days, plural,
                one {последний день}
                few {последние # дня}
                other {последние # дней}
            }`,
                HOURS: `{hours, plural,
                one {последний час}
                few {последние # часа}
                other {последние # часов}
            }`,
                MINUTES: `{minutes, plural,
                one {последнюю минуту}
                few {последние # минуты}
                other {последние # минут}
            }`,
                SECONDS: `{seconds, plural,
                one {последнюю секунду}
                few {последние # секунды}
                other {последние # секунд}
            }`,
                YEARS_FRACTION: `{years} лет`,
                MONTHS_FRACTION: `{months} месяцев`
            },
            option: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: 'и',
                YEARS: `{years, plural,
                one {последний год}
                few {последние # лет}
                other {последние # лет}
            }`,
                MONTHS: `{months, plural,
                one {последний месяц}
                few {последние # месяца}
                other {последние # месяцев}
            }`,
                WEEKS: `{weeks, plural,
                one {последняя неделя}
                few {последние # недели}
                other {последние # недель}
            }`,
                DAYS: `{days, plural,
                one {последний день}
                few {последние # дня}
                other {последние # дней}
            }`,
                HOURS: `{hours, plural,
                one {последний час}
                few {последние # часа}
                other {последние # часов}
            }`,
                MINUTES: `{minutes, plural,
                one {последняя минута}
                few {последние # минуты}
                other {последние # минут}
            }`,
                SECONDS: `{seconds, plural,
                one {последняя секунда}
                few {последние # секунды}
                other {последние # секунд}
            }`,
                YEARS_FRACTION: `{years} лет`,
                MONTHS_FRACTION: `{months} месяцев`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig
};
