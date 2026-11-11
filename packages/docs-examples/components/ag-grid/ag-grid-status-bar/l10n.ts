import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-status-bar example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    selected: string;
    totalRows: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        selected: 'Выбрано:',
        totalRows: 'Всего строк:'
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        selected: 'Selected:',
        totalRows: 'Total rows:'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
