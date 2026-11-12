import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleText {
    appName: string;
    projects: string;
    documentation: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
