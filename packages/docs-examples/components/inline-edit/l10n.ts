import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the inline-edit examples. Person names, role ids and permission ids stay as-is. */
export interface ExampleText {
    placeholder: string;
    country: string;
    capital: string;
    currency: string;
    label: string;
    name: string;
    description: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        country: 'Страна',
        capital: 'Столица',
        currency: 'Валюта',
        label: 'Метка',
        name: 'Имя',
        description: 'Описание'
    },
    default: {
        placeholder: 'Placeholder',
        country: 'Country',
        capital: 'Capital',
        currency: 'Currency',
        label: 'Label',
        name: 'Name',
        description: 'Description'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
