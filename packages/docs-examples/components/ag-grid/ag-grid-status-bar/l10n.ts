import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-status-bar example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    selected: string;
    totalRows: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
