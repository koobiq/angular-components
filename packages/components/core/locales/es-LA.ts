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
            emptySearchResult: 'No se encontró nada'
        },
        datePipe: {
            customPeriod: 'Período personalizado',
            customPeriodFrom: 'desde',
            customPeriodTo: 'hasta',
            customPeriodErrorHint: 'El período no puede empezar más tarde de lo que termina',
            backToPeriodSelection: 'Volver a la selección del período'
        }
    }
};
