import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the filesize formatter examples. Formulas (1 KB = 10³) stay as-is. */
export interface ExampleText {
    sizeInBits: string;
    numbersBehindDecimalPoint: string;
    default2: string;
    base: string;
    base10: string;
    base2: string;
    siStandard: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sizeInBits: 'Размер в битах',
        numbersBehindDecimalPoint: 'Знаков после запятой',
        default2: 'По умолчанию (2)',
        base: 'Основание',
        base10: 'Основание 10',
        base2: 'Основание 2',
        siStandard: 'байт = 1000 байт (стандарт SI)'
    },
    default: {
        sizeInBits: 'Size in bits',
        numbersBehindDecimalPoint: 'Numbers behind decimal point',
        default2: 'Default (2)',
        base: 'Base',
        base10: 'Base 10',
        base2: 'Base 2',
        siStandard: 'bytes = 1000 bytes (SI standard)'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
