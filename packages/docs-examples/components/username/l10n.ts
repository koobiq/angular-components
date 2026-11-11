import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the username examples. Person names and logins stay as proper nouns. */
export interface ExampleText {
    nameFormat: string;
    assignee: string;
    nothingFound: string;
    compact: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        nameFormat: 'Формат имени',
        assignee: 'Исполнитель',
        nothingFound: 'Ничего не найдено',
        compact: 'Компактно'
    },
    default: {
        nameFormat: 'Name format',
        assignee: 'Assignee',
        nothingFound: 'Nothing found',
        compact: 'Compact'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
