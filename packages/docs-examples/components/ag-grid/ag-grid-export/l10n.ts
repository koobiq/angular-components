import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-export example. */
export interface ExampleText {
    projectName: string;
    download: (format: string) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        projectName: 'Название проекта',
        download: (format) => `Скачать ${format}`
    },
    default: {
        projectName: 'Project name',
        download: (format) => `Download ${format}`
    }
};
