import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleTranslation {
    name: string;
    required: string;
    submit: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        name: 'Имя',
        required: 'Обязательно',
        submit: 'Отправить'
    },
    default: {
        name: 'Name',
        required: 'Required',
        submit: 'Submit'
    }
};
