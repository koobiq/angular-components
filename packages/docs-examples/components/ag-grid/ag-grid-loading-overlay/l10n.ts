import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-loading-overlay example. */
export interface ExampleText {
    headerText: string;
    showLoadingOverlay: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст',
        showLoadingOverlay: 'Показать оверлей загрузки'
    },
    default: {
        headerText: 'Text',
        showLoadingOverlay: 'Show loading overlay'
    }
};
