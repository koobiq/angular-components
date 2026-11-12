import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the ag-grid examples. */
export interface ExampleText {
    headerText: string;
    projectName: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта'
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name'
    }
};
