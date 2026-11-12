import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-on-submit example. */
export interface ExampleText {
    name: string;
    lastName: string;
    submit: string;
    serverError: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        submit: 'Отправить',
        serverError: 'Сервер не ответил при отправке данных. Попробуйте ещё раз.'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        submit: 'Submit',
        serverError: 'The server didn’t respond while sending data. Please try again.'
    }
};
