import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

export const faIRLocaleData = {
    select: { hiddenItemsText: '{{ number }} بیشتر' },
    datepicker: {
        placeholder: 'روز/ ماه/سال'
    },
    timepicker: {
        placeholder: {
            full: 'ثانیه:دقیقه:ساعت',
            short: 'دقیقه:ساعت'
        }
    },
    fileUpload: {
        single: {
            captionText: 'فایل را به اینجا بکشید یا {{ browseLink }}',
            browseLink: 'انتخاب کنید'
        },
        multiple: {
            captionText: 'به اینجا بکشید یا {{ browseLink }}',
            captionTextWhenSelected: 'فایل های بیشتری را بکشید یا {{ browseLink }}',
            captionTextForCompactSize: 'فایل ها را بکشید یا {{ browseLink }}',
            browseLink: 'انتخاب کنید',
            title: 'فایل ها را آپلود کنید',
            gridHeaders: {
                file: 'فایل',
                size: 'اندازه'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'فعال‌سازی سطربندی',
        softWrapOffTooltip: 'غیرفعال‌سازی سطربندی',
        downloadTooltip: 'دانلود',
        copiedTooltip: '✓ کپی شد',
        copyTooltip: 'کپی',
        viewAllText: 'نمایش همه',
        viewLessText: 'نمایش کمتر',
        openExternalSystemTooltip: 'باز کردن در سیستم خارجی'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: ' شهر یا منطقه زمانی '
    },
    actionsPanel: {
        closeTooltip: 'إلغاء التحديد'
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
    }
};
