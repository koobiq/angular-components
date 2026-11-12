import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the navbar examples. */
export interface ExampleText {
    dashboards: string;
    documentation: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dashboards: 'Дашборды',
        documentation: 'Документация'
    },
    default: {
        dashboards: 'Dashboards',
        documentation: 'Documentation'
    }
};
