import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

export const esLALocaleData = {
    select: { hiddenItemsText: '{{ number }} más' },
    datepicker: {
        placeholder: 'dd/mm/aaaa'
    },
    timepicker: {
        placeholder: {
            full: 'hh:mm:ss',
            short: 'hh:mm'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Arrastre el archivo aquí o {{ browseLink }}',
            browseLink: 'elija'
        },
        multiple: {
            captionText: 'Arrastre aquí o {{ browseLink }}',
            captionTextWhenSelected: 'Arrastre más archivos aquí o {{ browseLink }}',
            captionTextForCompactSize: 'Arrastre archivos o {{ browseLink }}',
            browseLink: 'elija',
            title: 'Cargue los archivos',
            gridHeaders: {
                file: 'Archivo',
                size: 'Tamaño'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Activar el ajuste de texto',
        softWrapOffTooltip: 'Desactivar el ajuste de texto',
        downloadTooltip: 'Descargar',
        copiedTooltip: '✓ Copiado',
        copyTooltip: 'Copiar',
        viewAllText: 'Mostrar todo',
        viewLessText: 'Mostrar menos',
        openExternalSystemTooltip: 'Abrir en el sistema externo'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'Ciudad o zona horaria'
    },
    actionsPanel: {
        closeTooltip: 'Desmarque'
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
