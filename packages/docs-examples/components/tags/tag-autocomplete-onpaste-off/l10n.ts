import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text of the onpaste-off example. */
export interface ExampleText {
    createTag: string;
    notFound: string;
    newTag: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        createTag: 'Создать: ',
        notFound: 'Ничего не найдено',
        newTag: 'Новый тег'
    },
    default: {
        createTag: 'Create: ',
        notFound: 'Nothing found',
        newTag: 'New tag'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
