import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-auto-hide-scroll-strategy example. */
export interface ExampleTranslation {
    scrollDown: string;
    scrollUp: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        scrollDown: 'Прокрутите вниз',
        scrollUp: 'Прокрутите вверх'
    },
    default: {
        scrollDown: 'Scroll down',
        scrollUp: 'Scroll up'
    }
};
