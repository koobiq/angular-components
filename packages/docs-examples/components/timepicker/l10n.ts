import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the timepicker examples. */
export interface ExampleText {
    required: string;
    minIs: (time: string) => string;
    maxIs: (time: string) => string;
    onlyNumbers: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        required: 'Обязательно',
        minIs: (time) => `Минимум ${time}`,
        maxIs: (time) => `Максимум ${time}`,
        onlyNumbers: 'Только цифры'
    },
    default: {
        required: 'Required',
        minIs: (time) => `Min is ${time}`,
        maxIs: (time) => `Maximum is ${time}`,
        onlyNumbers: 'Only numbers'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
