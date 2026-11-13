import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleTranslation {
    dashboards: string;
    documentation: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        dashboards: 'Дашборды',
        documentation: 'Документация'
    },
    default: {
        dashboards: 'Dashboards',
        documentation: 'Documentation'
    }
};
