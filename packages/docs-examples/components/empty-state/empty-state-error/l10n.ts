import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-error example. */
export interface ExampleText {
    errorTitle: string;
    errorText: string;
    refresh: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        errorTitle: 'Не удалось показать записи',
        errorText: 'Проблема с сетью или подключением к БД. Попробуйте еще раз или обратитесь к администратору.',
        refresh: 'Обновить'
    },
    default: {
        errorTitle: 'Failed to load records',
        errorText:
            'There is a problem with the network or the database connection. Please try again or contact your administrator.',
        refresh: 'Refresh'
    }
};
