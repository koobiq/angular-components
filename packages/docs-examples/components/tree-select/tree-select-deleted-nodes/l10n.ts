import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree-select examples. File names and host names stay as-is. */
export interface ExampleTranslation {
    deletedItems: (count: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        deletedItems: (count) => `Удалено элементов: ${count} — удалите их из выбора`
    },
    default: {
        deletedItems: (count) => `Deleted items: ${count} — remove them from the selection`
    }
};
