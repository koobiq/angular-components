import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the core examples. */
export interface ExampleText {
    pickTheme: string;
    day: string;
    night: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
