import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleTranslation {
    button: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        button: 'Кнопка'
    },
    default: {
        button: 'Button'
    }
};
