import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-infinite-selection example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    dtoSentToBackend: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
