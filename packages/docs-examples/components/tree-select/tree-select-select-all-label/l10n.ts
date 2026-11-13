import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree-select examples. File names and host names stay as-is. */
export interface ExampleTranslation {
    allNodes: string;
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        allNodes: 'Все узлы',
        placeholder: 'Плейсхолдер'
    },
    default: {
        allNodes: 'All nodes',
        placeholder: 'Placeholder'
    }
};
