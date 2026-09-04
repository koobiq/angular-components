import { KbqLocaleStringsData } from './types';

export const ruRULocaleData = {
    a11y: {
        close: 'Закрыть',
        save: 'Сохранить',
        cancel: 'Отменить',
        removeAll: 'Удалить все',
        remove: 'Удалить',
        expandBreadcrumbs: 'Показать скрытые элементы',
        previousMonth: 'Предыдущий месяц',
        currentDate: 'Текущая дата',
        nextMonth: 'Следующий месяц',
        clear: 'Очистить',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        resizeColumns: 'Изменить ширину колонок',
        toastRegion: 'Уведомления'
    },
    select: { hiddenItemsText: '+{{ number }}', selectAll: 'Выбрать все' },
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
            captionText: 'Перетащите сюда или {{ browseLink }}',
            captionTextOnlyFolder: 'Перетащите сюда или {{ browseLinkFolder }}',
            captionTextWithFolder: 'Перетащите сюда или {{ browseLink }} или {{ browseLinkFolderMixed }}',
            browseLink: 'выберите файл',
            browseLinkFolder: 'выберите папку',
            browseLinkFolderMixed: 'папку'
        },
        multiple: {
            captionText: 'или {{ browseLink }}',
            captionTextOnlyFolder: 'или {{ browseLinkFolder }}',
            captionTextWithFolder: 'или {{ browseLink }} или {{ browseLinkFolderMixed }}',
            captionTextWhenSelected: 'Перетащите еще или {{ browseLink }}',
            captionTextForCompactSize: 'Перетащите сюда или {{ browseLink }}',
            browseLink: 'выберите файлы',
            browseLinkFolder: 'выберите папку',
            browseLinkFolderMixed: 'папку',
            title: 'Перетащите сюда'
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
    },
    timezone: {
        searchPlaceholder: 'Город или часовой пояс'
    },
    actionsPanel: {
        closeTooltip: 'Отменить выбор'
    },
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
            saveAsNew: 'Новое название',
            change: 'Переименовать',
            resetChanges: 'Сбросить изменения',
            remove: 'Удалить',
            error: 'Поиск с таким названием уже существует',
            errorHint: 'Не удалось сохранить фильтр. Попробуйте снова или сообщите администратору.',
            saveButton: 'Сохранить',
            cancelButton: 'Отмена',
            actionsTooltip: 'Действия с фильтром'
        },
        add: {
            tooltip: 'Добавить фильтр',
            addedAnnouncement: 'Фильтр {{ name }} добавлен'
        },
        refresher: {
            refresh: 'Обновить',
            settings: 'Настройки обновления'
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
            customPeriodMinIntervalErrorHint: 'Период не может быть короче {{ value }}',
            customPeriodMaxIntervalErrorHint: 'Период не может быть длиннее {{ value }}',
            backToPeriodSelection: 'Назад'
        }
    },
    clampedText: {
        openText: 'Развернуть',
        closeText: 'Свернуть',
        showMoreText: 'Показать еще {exceededItemCount}',
        moreText: 'еще'
    },
    navbarIc: {
        toggle: {
            pinButton: 'Оставить развернутым',
            collapseButton: 'Свернуть'
        }
    },
    navbar: {
        toggle: {
            expand: 'Развернуть',
            collapse: 'Свернуть'
        }
    },
    searchExpandable: {
        tooltip: 'Поиск',
        placeholder: 'Поиск'
    },
    appSwitcher: {
        searchPlaceholder: 'Поиск',
        searchEmptyResult: 'Ничего не найдено',
        sitesHeader: 'Другие площадки',
        clearSearch: 'Очистить поиск'
    },
    popoverConfirm: {
        confirmText: 'Вы уверены, что хотите продолжить?',
        confirmButtonText: 'Да'
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
            rangeLabel: 'Период',
            allTime: 'за все время',
            currentQuarter: 'за текущий квартал',
            currentYear: 'за текущий год',
            allTimeOption: 'Все время',
            currentQuarterOption: 'Текущий квартал',
            currentYearOption: 'Текущий год'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' ',
                LAST_PART_SEPARATOR: 'и',
                YEARS: `{years, plural,
                one {# год}
                few {последние # года}
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
                one {Последний год}
                few {Последние # года}
                other {Последние # лет}
            }`,
                MONTHS: `{months, plural,
                one {Последний месяц}
                few {Последние # месяца}
                other {Последние # месяцев}
            }`,
                WEEKS: `{weeks, plural,
                one {Последняя неделя}
                few {Последние # недели}
                other {Последние # недель}
            }`,
                DAYS: `{days, plural,
                one {Последний день}
                few {Последние # дня}
                other {Последние # дней}
            }`,
                HOURS: `{hours, plural,
                one {Последний час}
                few {Последние # часа}
                other {Последние # часов}
            }`,
                MINUTES: `{minutes, plural,
                one {Последняя минута}
                few {Последние # минуты}
                other {Последние # минут}
            }`,
                SECONDS: `{seconds, plural,
                one {Последняя секунда}
                few {Последние # секунды}
                other {Последние # секунд}
            }`,
                YEARS_FRACTION: `{years} лет`,
                MONTHS_FRACTION: `{months} месяцев`
            }
        }
    },
    notificationCenter: {
        notifications: 'Уведомления',
        remove: 'Удалить',
        removeAll: 'Удалить все',
        doNotDisturb: 'Не беспокоить',
        showPopUpNotifications: 'Показывать всплывающие уведомления',
        noNotifications: 'Нет уведомлений',
        failedToLoadNotifications: 'Не удалось загрузить уведомления',
        repeat: 'Повторить',
        loadingMore: 'Загрузка уведомлений'
    }
} satisfies KbqLocaleStringsData;
