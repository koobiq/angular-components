import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration
} from './types';

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
            buttonName: 'Redefinir'
        },
        search: {
            tooltip: 'Pesquisar',
            placeholder: 'Pesquisar'
        },
        filters: {
            defaultName: 'Filtros',
            saveNewFilterTooltip: 'Salvar o novo filtro',
            searchPlaceholder: 'Pesquisar',
            searchEmptyResult: 'Nada encontrado',
            saveAsNewFilter: 'Salvar como novo filtro',
            saveChanges: 'Salvar alterações',
            saveAsNew: 'Salvar como novo',
            change: 'Editar',
            resetChanges: 'Redefinir',
            remove: 'Excluir',
            name: 'Nome',
            error: 'Já existe uma pesquisa com este nome',
            errorHint: 'Não foi possível salvar o filtro. Tente novamente ou entre em contato com o administrador.',
            saveButton: 'Salvar',
            cancelButton: 'Cancelar'
        },
        add: {
            tooltip: 'Adicionar filtro'
        },
        pipe: {
            clearButtonTooltip: 'Apagar',
            removeButtonTooltip: 'Excluir',
            applyButton: 'Aplicar',
            emptySearchResult: 'Nada encontrado',
            selectAll: 'Selecionar tudo'
        },
        datePipe: {
            customPeriod: 'Período personalizado',
            customPeriodFrom: 'de',
            customPeriodTo: 'até',
            customPeriodErrorHint: 'O início do período não pode ser posterior ao término do período',
            backToPeriodSelection: 'Retornar à seleção do período'
        }
    },
    clampedText: {
        openText: 'Expandir',
        closeText: 'Recolher'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'Deixar expandido',
            collapseButton: 'Recolher'
        }
    },
    searchExpandable: {
        tooltip: 'Pesquisar',
        placeholder: 'Pesquisar'
    }
};
