import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-no-message example. */
export interface ExampleTranslation {
    comment: string;
    submit: string;
    address: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
