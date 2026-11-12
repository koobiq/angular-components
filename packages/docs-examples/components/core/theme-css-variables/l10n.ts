import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the core examples. */
export interface ExampleText {
    currentTheme: string;
    switchTheme: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        currentTheme: 'Текущая тема:',
        switchTheme: 'Переключить тему'
    },
    default: {
        currentTheme: 'Current theme:',
        switchTheme: 'Switch theme'
    }
};
