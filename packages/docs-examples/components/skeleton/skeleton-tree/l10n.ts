import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-tree example. */
export interface ExampleText {
    loading: string;
    treeGroups: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка',
        treeGroups: ['Операторы', 'Администраторы', 'Разработчики', 'Тестировщики', 'Гости']
    },
    default: {
        loading: 'Loading',
        treeGroups: ['Operators', 'Administrators', 'Developers', 'Testers', 'Guests']
    }
};
