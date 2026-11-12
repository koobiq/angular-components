import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleText {
    dashboards: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dashboards: 'Дашборды'
    },
    default: {
        dashboards: 'Dashboards'
    }
};
