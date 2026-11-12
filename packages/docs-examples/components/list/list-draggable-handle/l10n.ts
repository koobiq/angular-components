import { Translations } from '@koobiq/docs-examples/i18n';

/** Fruit names of the drag-handle example. */
export interface ExampleTranslation {
    fruits: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        fruits: ['Банан', 'Вишня', 'Грейпфрут', 'Манго']
    },
    default: {
        fruits: ['Banana', 'Cherry', 'Grapefruit', 'Mango']
    }
};
