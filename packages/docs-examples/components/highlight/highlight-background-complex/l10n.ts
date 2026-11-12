import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the highlight examples. Search demo data (Cube articles, clubs) stays English so the queries match. */
export interface ExampleText {
    search: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        search: 'Поиск'
    },
    default: {
        search: 'Search'
    }
};
