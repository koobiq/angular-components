import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the list-draggable example. */
export interface ExampleText {
    item7Pinned: string;
    groupHeader: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        item7Pinned: 'Пункт 7. Сортировка запрещена',
        groupHeader: 'Заголовок группы'
    },
    default: {
        item7Pinned: 'Item 7. Sorting is prohibited',
        groupHeader: 'Group header'
    }
};
