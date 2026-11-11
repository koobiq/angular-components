import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleText {
    placeholder: string;
    nothingFound: string;
    loading: string;
    loadFailedRecords: string;
    tryAgain: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        nothingFound: 'Ничего не найдено',
        loading: 'Загрузка',
        loadFailedRecords: 'Не удалось показать записи',
        tryAgain: 'Повторить'
    },
    default: {
        placeholder: 'Placeholder',
        nothingFound: 'Nothing found',
        loading: 'Loading',
        loadFailedRecords: 'Failed to load records',
        tryAgain: 'Try Again'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
