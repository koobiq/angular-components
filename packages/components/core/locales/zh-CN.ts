import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

export const zhCNLocaleData = {
    select: { hiddenItemsText: '另外 {{ number }} 个' },
    datepicker: {
        placeholder: '年/月/日'
    },
    timepicker: {
        placeholder: {
            full: '时:分:秒',
            short: '时:分'
        }
    },
    fileUpload: {
        single: {
            captionText: '将文件拖到此处或{{ browseLink }}',
            browseLink: '选择'
        },
        multiple: {
            captionText: '拖到此处或{{ browseLink }}',
            captionTextWhenSelected: '拖动更多文件或{{ browseLink }}',
            captionTextForCompactSize: '拖动文件或{{ browseLink }}',
            browseLink: '选择',
            title: '上传文件',
            gridHeaders: {
                file: '文件',
                size: '大小'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: '启用文本换行',
        softWrapOffTooltip: '禁用文本换行',
        downloadTooltip: '下载',
        copiedTooltip: '✓已复制',
        copyTooltip: '复制',
        viewAllText: '显示全部',
        viewLessText: '显示部分',
        openExternalSystemTooltip: '在外部系统中打开'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: '城市或时区'
    },
    actionsPanel: {
        closeTooltip: '取消选择'
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
