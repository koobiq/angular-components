import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the ag-grid examples. */
export interface ExampleTranslation {
    headerText: string;
    projectName: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта'
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name'
    }
};
