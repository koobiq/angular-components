import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-tree example. */
export interface ExampleTranslation {
    loading: string;
    treeGroups: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка',
        treeGroups: ['Операторы', 'Администраторы', 'Разработчики', 'Тестировщики', 'Гости']
    },
    default: {
        loading: 'Loading',
        treeGroups: ['Operators', 'Administrators', 'Developers', 'Testers', 'Guests']
    }
};
