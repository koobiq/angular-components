import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleTranslation {
    nothingFound: string;
    loading: string;
    loadFailedRecords: string;
    tryAgain: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        nothingFound: 'Ничего не найдено',
        loading: 'Загрузка',
        loadFailedRecords: 'Не удалось показать записи',
        tryAgain: 'Повторить'
    },
    default: {
        nothingFound: 'Nothing found',
        loading: 'Loading',
        loadFailedRecords: 'Failed to load records',
        tryAgain: 'Try Again'
    }
};
