import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
} from './types';

export const ptBRLocaleData = {
    select: { hiddenItemsText: '+{{ number }}' },
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
            buttonName: 'Reconfigurar'
        },
        search: {
            tooltip: 'Buscar',
            placeholder: 'Buscar'
        },
        filters: {
            defaultName: 'Filtros',
            saveNewFilterTooltip: 'Salve o filtro novo',
            searchPlaceholder: 'Buscar',
            searchEmptyResult: 'Nada encontrado',
            saveAsNewFilter: 'Salve o filtro novo',
            saveChanges: 'Salve as mudanças',
            saveAsNew: 'Salve como novo',
            change: 'Editar',
            resetChanges: 'Reconfigurar',
            remove: 'Deletar',
            name: 'Nome',
            error: 'A busca com esse nome já existe',
            errorHint: 'O filtro não pôde ser salvo. Tente de novo ou entre em contato com o administrador.',
            saveButton: 'Salvar',
            cancelButton: 'Cancelar'
        },
        add: {
            tooltip: 'Adicionar filtros'
        },
        pipe: {
            clearButtonTooltip: 'Apagar',
            removeButtonTooltip: 'Deletar',
            applyButton: 'Aplicar',
            emptySearchResult: 'Nada encontrado',
            selectAll: 'Selecionar todos'
        },
        datePipe: {
            customPeriod: 'Selecionar período',
            customPeriodFrom: 'de',
            customPeriodTo: 'até',
            customPeriodErrorHint: 'O período não pode começar depois de quando acaba',
            backToPeriodSelection: 'Voltar à seleção de período'
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
    navbar: {
        toggle: {
            expand: 'Expandir',
            collapse: 'Colapso'
        }
    },
    searchExpandable: {
        tooltip: 'Pesquisar',
        placeholder: 'Pesquisar'
    },
    appSwitcher: {
        searchPlaceholder: 'Pesquisar',
        searchEmptyResult: 'Nada encontrado',
        sitesHeader: 'Outros sites'
    },
    timeRange: {
        title: {
            for: 'para',
            placeholder: 'Selecione o período'
        },
        editor: {
            from: 'de',
            to: 'até',
            apply: 'Aplicar',
            cancel: 'Cancelar',
            rangeLabel: 'para o período',
            allTime: 'por todo o tempo',
            currentQuarter: 'pelo trimestre atual',
            currentYear: 'pelo ano atual'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ' e ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# ano}
                other {últimos # anos}
            }`,
                MONTHS: `{months, plural,
                one {último mês}
                other {últimos # meses}
            }`,
                WEEKS: `{weeks, plural,
                one {última semana}
                other {últimas # semanas}
            }`,
                DAYS: `{days, plural,
                one {último dia}
                other {últimos # dias}
            }`,
                HOURS: `{hours, plural,
                one {última hora}
                other {últimas # horas}
            }`,
                MINUTES: `{minutes, plural,
                one {último minuto}
                other {últimos # minutos}
            }`,
                SECONDS: `{seconds, plural,
                one {último segundo}
                other {últimos # segundos}
            }`,
                YEARS_FRACTION: `{years} anos`,
                MONTHS_FRACTION: `{months} meses`
            },
            option: {
                SEPARATOR: ' e ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# ano}
                other {últimos # anos}
            }`,
                MONTHS: `{months, plural,
                one {último mês}
                other {últimos # meses}
            }`,
                WEEKS: `{weeks, plural,
                one {última semana}
                other {últimas # semanas}
            }`,
                DAYS: `{days, plural,
                one {último dia}
                other {últimos # dias}
            }`,
                HOURS: `{hours, plural,
                one {última hora}
                other {últimas # horas}
            }`,
                MINUTES: `{minutes, plural,
                one {último minuto}
                other {últimos # minutos}
            }`,
                SECONDS: `{seconds, plural,
                one {último segundo}
                other {últimos # segundos}
            }`,
                YEARS_FRACTION: `{years} anos`,
                MONTHS_FRACTION: `{months} meses`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig,
    notificationCenter: {
        notifications: 'Notificações',
        remove: 'Remover',
        doNotDisturb: 'Não perturbe',
        showPopUpNotifications: 'Mostrar notificações pop-up',
        noNotifications: 'Sem notificações',
        failedToLoadNotifications: 'Falha ao carregar notificações',
        repeat: 'Repetir'
    }
};
