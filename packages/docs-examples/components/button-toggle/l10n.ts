import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the button toggle examples. */
export interface ExampleText {
    courier: string;
    donkeyExpress: string;
    middleEarthPost: string;
    deliveryMethod: string;
    longToggleText: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        courier: 'Курьером',
        donkeyExpress: 'Ослик Экспресс',
        middleEarthPost: 'Почтой Средиземья',
        deliveryMethod: 'Способ доставки',
        longToggleText: 'Длинный текст кнопки-переключателя, чтобы показать, как обрезается текст'
    },
    default: {
        courier: 'Courier',
        donkeyExpress: 'Donkey Express',
        middleEarthPost: 'Middle-earth Post',
        deliveryMethod: 'Delivery method',
        longToggleText: 'Long toggle button text to show how the text gets truncated'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
