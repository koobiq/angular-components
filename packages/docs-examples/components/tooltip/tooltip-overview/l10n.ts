import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleTranslation {
    add: string;
    create: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        add: 'Добавить',
        create: 'Создать'
    },
    default: {
        add: 'Add',
        create: 'Create'
    }
};
