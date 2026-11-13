import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-readonly example. */
export interface ExampleTranslation {
    placeholder: string;
    showPassword: string;
    hidePassword: string;
    password: string;
    readonly: string;
    text: string;
    number: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        password: 'Пароль',
        readonly: 'Только для чтения',
        text: 'Текст',
        number: 'Число'
    },
    default: {
        placeholder: 'Placeholder',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        password: 'Password',
        readonly: 'Readonly',
        text: 'Text',
        number: 'Number'
    }
};
