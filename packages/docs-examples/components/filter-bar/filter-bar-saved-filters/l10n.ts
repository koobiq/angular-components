import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the saved-filters example: it has no counterpart in the library's locale data. */
export interface ExampleTranslation {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
    search: string;
    retry: string;
    deleteError: string;
    saveError: (name: string) => string;
    /** Period labels of the `date` / `datetime` presets, keyed by `nameKey`; the data itself stays stable. */
    periods: Record<string, string>;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        search: 'Поиск',
        retry: 'Повторить',
        deleteError: 'Не удалось удалить фильтр: ',
        saveError: (name: string) => `Не удалось сохранить фильтр: ${name}`,
        periods: {
            'filters.last24h': 'Последние 24 часа',
            'filters.last7days': 'Последние 7 дней',
            'filters.last30days': 'Последние 30 дней',
            'filters.lastYear': 'Последний год'
        }
    },
    default: {
        search: 'Search',
        retry: 'Retry',
        deleteError: 'Could not delete the filter: ',
        saveError: (name: string) => `Could not save the filter: ${name}`,
        periods: {
            'filters.last24h': 'Last 24 hours',
            'filters.last7days': 'Last 7 days',
            'filters.last30days': 'Last 30 days',
            'filters.lastYear': 'Last year'
        }
    }
};
