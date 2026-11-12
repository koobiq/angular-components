import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the icon examples. Size and color names (Normal, Compact, Theme) stay English as API names. */
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
