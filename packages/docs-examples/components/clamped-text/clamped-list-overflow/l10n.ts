import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the overflow-based clamped-list example. */
export interface ExampleTranslation {
    itemLabel: (index: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        itemLabel: (index) => `Элемент списка ${index}`
    },
    default: {
        itemLabel: (index) => `Clamped list item ${index}`
    }
};
