import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the saved-filters example: it has no counterpart in the library's locale data. */
export interface ExampleText {
    search: string;
    retry: string;
    deleteError: string;
    saveError: (name: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        search: 'Поиск',
        retry: 'Повторить',
        deleteError: 'Не удалось удалить фильтр: ',
        saveError: (name: string) => `Не удалось сохранить фильтр: ${name}`
    },
    default: {
        search: 'Search',
        retry: 'Retry',
        deleteError: 'Could not delete the filter: ',
        saveError: (name: string) => `Could not save the filter: ${name}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
