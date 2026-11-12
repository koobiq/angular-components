import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-copy-selected example. */
export interface ExampleTranslation {
    headerText: string;
    projectName: string;
    dataCopied: string;
    dataCopiedCaption: (format: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        dataCopied: 'Данные скопированы',
        dataCopiedCaption: (format) => `Выбранные строки скопированы в буфер обмена. Формат: ${format}`
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        dataCopied: 'Data copied',
        dataCopiedCaption: (format) => `Selected nodes have been copied to clipboard. Format: ${format}`
    }
};
