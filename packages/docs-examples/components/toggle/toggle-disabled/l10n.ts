import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the toggle examples. */
export interface ExampleTranslation {
    vibration: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        vibration: 'Вибрация'
    },
    default: {
        vibration: 'Vibration'
    }
};
