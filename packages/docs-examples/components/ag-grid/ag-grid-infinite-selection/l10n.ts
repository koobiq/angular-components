import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-infinite-selection example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    dtoSentToBackend: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        dtoSentToBackend: 'DTO, отправляемый на бэкенд:'
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        dtoSentToBackend: 'DTO sent to the backend:'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
