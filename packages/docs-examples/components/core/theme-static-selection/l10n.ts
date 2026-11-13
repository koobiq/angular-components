import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the core examples. */
export interface ExampleTranslation {
    pickTheme: string;
    day: string;
    night: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        pickTheme: 'Выберите тему',
        day: 'День',
        night: 'Ночь'
    },
    default: {
        pickTheme: 'Pick a theme',
        day: 'Day',
        night: 'Night'
    }
};
