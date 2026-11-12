import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree-select examples. File names and host names stay as-is. */
export interface ExampleText {
    deletedItems: (count: number) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        deletedItems: (count) => `Удалено элементов: ${count} — удалите их из выбора`
    },
    default: {
        deletedItems: (count) => `Deleted items: ${count} — remove them from the selection`
    }
};
