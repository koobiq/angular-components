import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree-select examples. File names and host names stay as-is. */
export interface ExampleText {
    allNodes: string;
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        allNodes: 'Все узлы',
        placeholder: 'Плейсхолдер'
    },
    default: {
        allNodes: 'All nodes',
        placeholder: 'Placeholder'
    }
};
