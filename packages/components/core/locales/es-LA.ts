import {
    KbqActionsPanelLocaleConfiguration,
    KbqClampedTextLocaleConfig,
    KbqCodeBlockLocaleConfiguration,
    KbqTimeRangeLocaleConfig
} from './types';

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
            buttonName: 'Reiniciar'
        },
        search: {
            tooltip: 'Búsqueda',
            placeholder: 'Búsqueda'
        },
        filters: {
            defaultName: 'Filtros',
            saveNewFilterTooltip: 'Guardar el nuevo filtro',
            searchPlaceholder: 'Búsqueda',
            searchEmptyResult: 'No se encontró nada',
            saveAsNewFilter: 'Guardar como nuevo filtro',
            saveChanges: 'Guardar los cambios',
            saveAsNew: 'Guardar como nuevo',
            change: 'Editar',
            resetChanges: 'Reiniciar',
            remove: 'Eliminar',
            name: 'Nombre',
            error: 'La búsqueda con ese nombre ya existe',
            errorHint: 'No se pudo guardar el filtro. Intente de nuevo o póngase en contacto con el administrador.',
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
            customPeriod: 'Período personalizado',
            customPeriodFrom: 'desde',
            customPeriodTo: 'hasta',
            customPeriodErrorHint: 'El período no puede empezar más tarde de lo que termina',
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
    searchExpandable: {
        tooltip: 'Búsqueda',
        placeholder: 'Búsqueda'
    },
    timeRange: {
        title: {
            for: 'para'
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
    } satisfies KbqTimeRangeLocaleConfig
};
