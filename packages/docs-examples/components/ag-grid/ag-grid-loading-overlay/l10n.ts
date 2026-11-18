import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-loading-overlay example. */
export interface ExampleTranslation {
    headerText: string;
    showLoadingOverlay: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст',
        showLoadingOverlay: 'Показать оверлей загрузки'
    },
    default: {
        headerText: 'Text',
        showLoadingOverlay: 'Show loading overlay'
    }
};
