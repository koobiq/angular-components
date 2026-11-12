import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleText {
    nothingFound: string;
    loading: string;
    loadFailedRecords: string;
    tryAgain: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
