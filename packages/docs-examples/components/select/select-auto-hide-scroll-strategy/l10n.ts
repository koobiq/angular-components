import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-auto-hide-scroll-strategy example. */
export interface ExampleText {
    scrollDown: string;
    scrollUp: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        scrollDown: 'Прокрутите вниз',
        scrollUp: 'Прокрутите вверх'
    },
    default: {
        scrollDown: 'Scroll down',
        scrollUp: 'Scroll up'
    }
};
