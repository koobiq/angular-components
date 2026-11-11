import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-row-actions example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    rowCopied: (index: number) => string;
    rowArchived: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        rowCopied: (index) => `Строка №${index} скопирована`,
        rowArchived: (index) => `Строка №${index} заархивирована`
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        rowCopied: (index) => `Row #${index} copied`,
        rowArchived: (index) => `Row #${index} archived`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
