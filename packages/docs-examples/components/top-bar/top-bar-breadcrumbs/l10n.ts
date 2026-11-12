import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleText {
    filter: string;
    share: string;
    dashboards: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
