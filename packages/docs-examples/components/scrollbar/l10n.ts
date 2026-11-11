import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the scrollbar examples. */
export interface ExampleText {
    scrollTop: string;
    scrollBottom: string;
    scrollStart: string;
    scrollEnd: string;
    scrollToElement: string;
    scrollIntoView: string;
    addItems: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        scrollTop: 'Наверх',
        scrollBottom: 'Вниз',
        scrollStart: 'В начало',
        scrollEnd: 'В конец',
        scrollToElement: 'ПРОКРУТКА К ЭЛЕМЕНТУ',
        scrollIntoView: 'ПРОКРУТКА В ОБЛАСТЬ ВИДИМОСТИ',
        addItems: 'Добавить элементы'
    },
    default: {
        scrollTop: 'Scroll top',
        scrollBottom: 'Scroll bottom',
        scrollStart: 'Scroll start',
        scrollEnd: 'Scroll end',
        scrollToElement: 'SCROLL TO ELEMENT',
        scrollIntoView: 'SCROLL INTO VIEW',
        addItems: 'Add items'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
