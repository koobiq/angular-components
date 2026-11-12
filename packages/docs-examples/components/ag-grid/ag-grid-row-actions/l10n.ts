import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-row-actions example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    rowCopied: (index: number) => string;
    rowArchived: (index: number) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
