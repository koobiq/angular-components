import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    appName: string;
    projects: string;
    documentation: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        appName: 'Название приложения',
        projects: 'Проекты',
        documentation: 'Документация'
    },
    default: {
        appName: 'App name',
        projects: 'Projects',
        documentation: 'Documentation'
    }
};
