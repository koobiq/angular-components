import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleTranslation {
    dashboards: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        dashboards: 'Дашборды'
    },
    default: {
        dashboards: 'Dashboards'
    }
};
