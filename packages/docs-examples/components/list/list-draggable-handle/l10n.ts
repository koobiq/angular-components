import { Translations } from '@koobiq/docs-examples/i18n';

/** Fruit names of the drag-handle example. */
export interface ExampleTranslation {
    fruits: { id: number; label: string }[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        fruits: [
            { id: 1, label: 'Банан' },
            { id: 2, label: 'Вишня' },
            { id: 3, label: 'Грейпфрут' },
            { id: 4, label: 'Манго' }
        ]
    },
    default: {
        fruits: [
            { id: 1, label: 'Banana' },
            { id: 2, label: 'Cherry' },
            { id: 3, label: 'Grapefruit' },
            { id: 4, label: 'Mango' }
        ]
    }
};
