import { KbqActionsPanelLocaleConfiguration, KbqCodeBlockLocaleConfiguration } from './types';

export const enUSLocaleData = {
    select: { hiddenItemsText: '{{ number }} more' },
    datepicker: {
        placeholder: 'yyyy-mm-dd',
        dateInput: 'yyyy-MM-dd'
    },
    timepicker: {
        placeholder: {
            full: 'hh:mm:ss',
            short: 'hh:mm'
        }
    },
    fileUpload: {
        single: {
            captionText: 'Drag file here or {{ browseLink }}',
            browseLink: 'choose'
        },
        multiple: {
            captionText: 'Drag here or {{ browseLink }}',
            captionTextWhenSelected: 'Drag more files or {{ browseLink }}',
            captionTextForCompactSize: 'Drag files or {{ browseLink }}',
            browseLink: 'choose',
            title: 'Upload files',
            gridHeaders: {
                file: 'File',
                size: 'Size'
            }
        }
    },
    codeBlock: {
        softWrapOnTooltip: 'Enable word wrap',
        softWrapOffTooltip: 'Disable word wrap',
        downloadTooltip: 'Download',
        copiedTooltip: '✓ Copied',
        copyTooltip: 'Copy',
        viewAllText: 'Show all',
        viewLessText: 'Show less',
        openExternalSystemTooltip: 'Open in the external system'
    } satisfies KbqCodeBlockLocaleConfiguration,
    timezone: {
        searchPlaceholder: 'City or time zone'
    },
    actionsPanel: {
        closeTooltip: 'Deselect'
    } satisfies KbqActionsPanelLocaleConfiguration
};
