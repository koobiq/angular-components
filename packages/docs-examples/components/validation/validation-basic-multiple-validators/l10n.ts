import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-basic-multiple-validators example. */
export interface ExampleTranslation {
    required: string;
    submit: string;
    username: string;
    min5: string;
    max20: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        required: 'Обязательно',
        submit: 'Отправить',
        username: 'Имя пользователя',
        min5: 'Минимум 5 символов',
        max20: 'Максимум 20 символов'
    },
    default: {
        required: 'Required',
        submit: 'Submit',
        username: 'Username',
        min5: 'Minimum 5 characters',
        max20: 'Maximum 20 characters'
    }
};
