import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleTranslation {
    filter: string;
    share: string;
    dashboards: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        filter: 'Фильтр',
        share: 'Поделиться',
        dashboards: 'Дашборды'
    },
    default: {
        filter: 'Filter',
        share: 'Share',
        dashboards: 'Dashboards'
    }
};
