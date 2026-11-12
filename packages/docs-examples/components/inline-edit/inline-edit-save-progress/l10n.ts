import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the inline-edit examples. Person names, role ids and permission ids stay as-is. */
export interface ExampleTranslation {
    placeholder: string;
    name: string;
    description: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        name: 'Имя',
        description: 'Описание'
    },
    default: {
        placeholder: 'Placeholder',
        name: 'Name',
        description: 'Description'
    }
};
