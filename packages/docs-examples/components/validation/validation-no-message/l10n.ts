import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-no-message example. */
export interface ExampleText {
    comment: string;
    submit: string;
    address: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        comment: 'Комментарий',
        submit: 'Отправить',
        address: 'Адрес'
    },
    default: {
        comment: 'Comment',
        submit: 'Submit',
        address: 'Address'
    }
};
