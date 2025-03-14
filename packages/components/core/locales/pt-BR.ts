import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

export const ptBRLocaleData = {
    select: { hiddenItemsText: '{{ number }} mais' },
    datepicker: {
        placeholder: 'dd/mm/yyyy'
    },
    timepicker: {
        placeholder: {
            full: 'hh:mm:ss',
            short: 'hh:mm'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Arrastar o arquivo aqui ou {{ browseLink }}',
            browseLink: 'escolher'
        },
        multiple: {
            captionText: 'Arrastar aqui ou {{ browseLink }}',
            captionTextWhenSelected: 'Arrastar mais arquivos aqui ou {{ browseLink }}',
            captionTextForCompactSize: 'Arrastar arquivos ou {{ browseLink }}',
            browseLink: 'escolher',
            title: 'Carregar arquivos',
            gridHeaders: {
                file: 'Arquivo',
                size: 'Tamanho'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Ativar quebra de linha',
        softWrapOffTooltip: 'Desativar quebra de linha',
        downloadTooltip: 'Baixar',
        copiedTooltip: '✓ Copiado',
        copyTooltip: 'Copiar',
        viewAllText: 'Mostrar todos',
        viewLessText: 'Mostrar menos',
        openExternalSystemTooltip: 'Abrir em sistema externo'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'Cidade ou fuso horário'
    },
    actionsPanel: {
        closeTooltip: 'Desmarcar'
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
