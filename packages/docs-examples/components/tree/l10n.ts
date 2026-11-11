import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleText {
    branch: (index: number) => string;
    disabledNode: string;
    lonelyLeaf: string;
    badge: string;
    action: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        branch: (index) => `Ветка ${index}`,
        disabledNode: 'Отключённый узел',
        lonelyLeaf: 'Одинокий лист',
        badge: 'бейдж',
        action: (index) => `действие ${index}`
    },
    default: {
        branch: (index) => `Branch ${index}`,
        disabledNode: 'Disabled Node',
        lonelyLeaf: 'Lonely leaf',
        badge: 'badge',
        action: (index) => `action ${index}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
