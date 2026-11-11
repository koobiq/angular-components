import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the list-draggable example. */
export interface ExampleText {
    item7Pinned: string;
    groupHeader: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        item7Pinned: 'Пункт 7. Сортировка запрещена',
        groupHeader: 'Заголовок группы'
    },
    default: {
        item7Pinned: 'Item 7. Sorting is prohibited',
        groupHeader: 'Group header'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
