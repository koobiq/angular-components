import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the list examples. */
export interface ExampleTranslation {
    selected: string;
    items: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        selected: 'Выбрано:',
        items: 'Пункты'
    },
    default: {
        selected: 'Selected:',
        items: 'Items'
    }
};
