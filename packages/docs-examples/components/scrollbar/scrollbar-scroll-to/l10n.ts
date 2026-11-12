import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the scrollbar examples. */
export interface ExampleTranslation {
    scrollTop: string;
    scrollBottom: string;
    scrollStart: string;
    scrollEnd: string;
    scrollToElement: string;
    scrollIntoView: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        scrollTop: 'Наверх',
        scrollBottom: 'Вниз',
        scrollStart: 'В начало',
        scrollEnd: 'В конец',
        scrollToElement: 'ПРОКРУТКА К ЭЛЕМЕНТУ',
        scrollIntoView: 'ПРОКРУТКА В ОБЛАСТЬ ВИДИМОСТИ'
    },
    default: {
        scrollTop: 'Scroll top',
        scrollBottom: 'Scroll bottom',
        scrollStart: 'Scroll start',
        scrollEnd: 'Scroll end',
        scrollToElement: 'SCROLL TO ELEMENT',
        scrollIntoView: 'SCROLL INTO VIEW'
    }
};
