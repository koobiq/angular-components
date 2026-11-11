import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-infinite-selection example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    dtoSentToBackend: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        dtoSentToBackend: 'DTO, отправляемый на бэкенд:'
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        dtoSentToBackend: 'DTO sent to the backend:'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
