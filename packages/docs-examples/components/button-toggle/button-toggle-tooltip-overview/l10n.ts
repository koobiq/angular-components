import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the button toggle examples. */
export interface ExampleText {
    donkeyExpress: string;
    middleEarthPost: string;
    longToggleText: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        donkeyExpress: 'Ослик Экспресс',
        middleEarthPost: 'Почтой Средиземья',
        longToggleText: 'Длинный текст кнопки-переключателя, чтобы показать, как обрезается текст'
    },
    default: {
        donkeyExpress: 'Donkey Express',
        middleEarthPost: 'Middle-earth Post',
        longToggleText: 'Long toggle button text to show how the text gets truncated'
    }
};
