import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleTranslation {
    disabledNode: string;
    lonelyLeaf: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        disabledNode: 'Отключённый узел',
        lonelyLeaf: 'Одинокий лист'
    },
    default: {
        disabledNode: 'Disabled Node',
        lonelyLeaf: 'Lonely leaf'
    }
};
