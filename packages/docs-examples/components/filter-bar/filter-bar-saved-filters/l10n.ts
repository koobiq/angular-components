import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the saved-filters example: it has no counterpart in the library's locale data. */
export interface ExampleTranslation {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
    search: string;
    retry: string;
    deleteError: string;
    saveError: (name: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
