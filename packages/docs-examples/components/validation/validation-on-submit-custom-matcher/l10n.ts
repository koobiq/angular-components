import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleTranslation {
    name: string;
    lastName: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия'
    },
    default: {
        name: 'Name',
        lastName: 'Last name'
    }
};
