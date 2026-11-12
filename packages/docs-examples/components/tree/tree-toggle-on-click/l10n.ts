import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleText {
    disabledNode: string;
    lonelyLeaf: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        disabledNode: 'Отключённый узел',
        lonelyLeaf: 'Одинокий лист'
    },
    default: {
        disabledNode: 'Disabled Node',
        lonelyLeaf: 'Lonely leaf'
    }
};
