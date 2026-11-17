import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleTranslation {
    buttonText: string;
    longButtonText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        buttonText: 'Текст кнопки',
        longButtonText: 'Очень длинный текст кнопки'
    },
    default: {
        buttonText: 'Button text',
        longButtonText: 'Very long button text'
    }
};
