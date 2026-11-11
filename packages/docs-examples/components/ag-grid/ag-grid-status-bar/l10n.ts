import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-status-bar example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    selected: string;
    totalRows: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        selected: 'Выбрано:',
        totalRows: 'Всего строк:'
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        selected: 'Selected:',
        totalRows: 'Total rows:'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
