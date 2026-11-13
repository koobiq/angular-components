import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the scrollbar examples. */
export interface ExampleTranslation {
    addItems: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        addItems: 'Добавить элементы'
    },
    default: {
        addItems: 'Add items'
    }
};
