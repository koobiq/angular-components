import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleText {
    disabledNode: string;
    lonelyLeaf: string;
    badge: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        disabledNode: 'Отключённый узел',
        lonelyLeaf: 'Одинокий лист',
        badge: 'бейдж'
    },
    default: {
        disabledNode: 'Disabled Node',
        lonelyLeaf: 'Lonely leaf',
        badge: 'badge'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
