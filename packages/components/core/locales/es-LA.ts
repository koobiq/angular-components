import { KbqCodeBlockLocaleConfiguration } from './types';

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
    }
};
