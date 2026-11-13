import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the core examples. */
export interface ExampleTranslation {
    currentTheme: string;
    switchTheme: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        currentTheme: 'Текущая тема:',
        switchTheme: 'Переключить тему'
    },
    default: {
        currentTheme: 'Current theme:',
        switchTheme: 'Switch theme'
    }
};
