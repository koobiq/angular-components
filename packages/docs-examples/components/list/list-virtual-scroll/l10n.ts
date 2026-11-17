import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the list-virtual-scroll example. */
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
