import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqFileUploadLocaleConfig,
    KbqTimeRangeLocaleConfig
} from './types';

export const esLALocaleData = {
    select: { hiddenItemsText: '+{{ number }}' },
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
            captionTextOnlyFolder: 'Arrastre el archivo aquí o {{ browseLinkFolder }}',
            captionTextWithFolder: 'Arrastre el archivo aquí o {{ browseLink }} o {{ browseLinkFolder }}',
            browseLink: 'elija',
            browseLinkFolder: 'carpeta'
        },
        multiple: {
            captionText: 'Arrastre aquí o [[browseLink:elija]]',
            captionTextOnlyFolder: 'Arrastre aquí o [[browseLinkForFolder:carpeta]]',
            captionTextWithFolder: 'Arrastre aquí o [[browseLink:elija]] o [[browseLinkForFolder:carpeta]]',
            captionTextWhenSelected: 'Arrastre más archivos aquí o [[browseLink:elija]]',
            captionTextForCompactSize: 'Arrastre archivos o [[browseLink:elija]]',
            browseLink: 'elija',
            browseLinkFolder: 'carpeta',
            title: 'Cargue los archivos',
            gridHeaders: {
                file: 'Archivo',
                size: 'Tamaño'
            }
        }
    } satisfies KbqFileUploadLocaleConfig,
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
            buttonName: 'Restablecer'
        },
        search: {
            tooltip: 'Búsqueda',
            placeholder: 'Búsqueda'
        },
        filters: {
            defaultName: 'Filtros',
            saveNewFilterTooltip: 'Guardar el filtro nuevo',
            searchPlaceholder: 'Búsqueda',
            searchEmptyResult: 'No se encontró nada',
            saveAsNewFilter: 'Guardar como filtro nuevo',
            saveChanges: 'Guardar cambios',
            saveAsNew: 'Guardar como nuevo',
            change: 'Editar',
            resetChanges: 'Restablecer',
            remove: 'Eliminar',
            name: 'Nombre',
            error: 'Ya existe una búsqueda con ese nombre',
            errorHint: 'No se pudo guardar el filtro. Intente de nuevo o comuníquese con el administrador.',
            saveButton: 'Guardar',
            cancelButton: 'Cancelar'
        },
        add: {
            tooltip: 'Agregar filtro'
        },
        pipe: {
            clearButtonTooltip: 'Borrar',
            removeButtonTooltip: 'Eliminar',
            applyButton: 'Aplicar',
            emptySearchResult: 'No se encontró nada',
            selectAll: 'Seleccionar todo'
        },
        datePipe: {
            customPeriod: 'Personalizar período',
            customPeriodFrom: 'desde',
            customPeriodTo: 'hasta',
            customPeriodErrorHint: 'El inicio del período no puede estar después del fin',
            backToPeriodSelection: 'Volver a la selección del período'
        }
    },
    clampedText: {
        openText: 'Expandir',
        closeText: 'Contraer'
    } satisfies KbqClampedTextLocaleConfig,
    navbarIc: {
        toggle: {
            pinButton: 'Expandir el menú',
            collapseButton: 'Colapsar'
        }
    },
    navbar: {
        toggle: {
            expand: 'Expandir',
            collapse: 'Colapsar'
        }
    },
    searchExpandable: {
        tooltip: 'Búsqueda',
        placeholder: 'Búsqueda'
    },
    appSwitcher: {
        searchPlaceholder: 'Búsqueda',
        searchEmptyResult: 'No se encontró nada',
        sitesHeader: 'Otros sitios'
    },
    timeRange: {
        title: {
            for: 'para',
            placeholder: 'Seleccione el período'
        },
        editor: {
            from: 'de',
            to: 'a',
            apply: 'Aplicar',
            cancel: 'Cancelar',
            rangeLabel: 'para el período',
            allTime: 'por todo el tiempo',
            currentQuarter: 'por el trimestre actual',
            currentYear: 'por el año actual'
        },
        durationTemplate: {
            title: {
                SEPARATOR: ', ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# año}
                other {últimos # años}
            }`,
                MONTHS: `{months, plural,
                one {último mes}
                other {últimos # meses}
            }`,
                WEEKS: `{weeks, plural,
                one {última semana}
                other {últimas # semanas}
            }`,
                DAYS: `{days, plural,
                one {último día}
                other {últimos # días}
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
                YEARS_FRACTION: `{years} años`,
                MONTHS_FRACTION: `{months} meses`
            },
            option: {
                SEPARATOR: ', ',
                LAST_PART_SEPARATOR: '',
                YEARS: `{years, plural,
                one {# año}
                other {últimos # años}
            }`,
                MONTHS: `{months, plural,
                one {último mes}
                other {últimos # meses}
            }`,
                WEEKS: `{weeks, plural,
                one {última semana}
                other {últimas # semanas}
            }`,
                DAYS: `{days, plural,
                one {último día}
                other {últimos # días}
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
                YEARS_FRACTION: `{years} años`,
                MONTHS_FRACTION: `{months} meses`
            }
        }
    } satisfies KbqTimeRangeLocaleConfig,
    notificationCenter: {
        notifications: 'Notificaciones',
        remove: 'Eliminar',
        doNotDisturb: 'No molestar',
        showPopUpNotifications: 'Mostrar notificaciones emergentes',
        noNotifications: 'Sin notificaciones',
        failedToLoadNotifications: 'Error al cargar las notificaciones',
        repeat: 'Repetir'
    }
};
