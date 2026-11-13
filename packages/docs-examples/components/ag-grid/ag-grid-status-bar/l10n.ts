import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-status-bar example. */
export interface ExampleTranslation {
    headerText: string;
    projectName: string;
    selected: string;
    totalRows: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
