import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the button-group-vertical example. */
export interface ExampleTranslation {
    minus: string;
    plus: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        minus: 'Минус',
        plus: 'Плюс'
    },
    default: {
        minus: 'Minus',
        plus: 'Plus'
    }
};
