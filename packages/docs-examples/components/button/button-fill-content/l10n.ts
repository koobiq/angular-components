import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the button examples. */
export interface ExampleTranslation {
    truncatedButtonText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        truncatedButtonText: 'Очень длинный текст кнопки, который обрезается по ширине'
    },
    default: {
        truncatedButtonText: 'Very long button text that gets truncated by width'
    }
};
