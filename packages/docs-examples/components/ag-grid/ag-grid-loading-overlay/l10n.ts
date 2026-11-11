import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-loading-overlay example. */
export interface ExampleText {
    headerText: string;
    showLoadingOverlay: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        showLoadingOverlay: 'Показать оверлей загрузки'
    },
    default: {
        headerText: 'Text',
        showLoadingOverlay: 'Show loading overlay'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
