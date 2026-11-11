import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-tree example. */
export interface ExampleText {
    loading: string;
    treeGroups: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        treeGroups: ['Операторы', 'Администраторы', 'Разработчики', 'Тестировщики', 'Гости']
    },
    default: {
        loading: 'Loading',
        treeGroups: ['Operators', 'Administrators', 'Developers', 'Testers', 'Guests']
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
