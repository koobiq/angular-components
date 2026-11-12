import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Fruit names of the drag-handle example. */
export interface ExampleText {
    fruits: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fruits: ['Банан', 'Вишня', 'Грейпфрут', 'Манго']
    },
    default: {
        fruits: ['Banana', 'Cherry', 'Grapefruit', 'Mango']
    }
};
