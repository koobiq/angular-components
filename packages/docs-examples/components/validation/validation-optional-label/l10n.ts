import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleTranslation {
    name: string;
    lastName: string;
    patronymic: string;
    optional: string;
    submit: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        optional: 'Необязательно',
        submit: 'Отправить'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        optional: 'Optional',
        submit: 'Submit'
    }
};
