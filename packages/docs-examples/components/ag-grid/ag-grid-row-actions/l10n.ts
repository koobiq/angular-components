import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-actions example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    rowCopied: (index: number) => string;
    rowArchived: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        rowCopied: (index) => `Строка №${index} скопирована`,
        rowArchived: (index) => `Строка №${index} заархивирована`
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        rowCopied: (index) => `Row #${index} copied`,
        rowArchived: (index) => `Row #${index} archived`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
