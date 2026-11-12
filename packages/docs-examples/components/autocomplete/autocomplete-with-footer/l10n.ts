import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the autocomplete-with-footer example. */
export interface ExampleText {
    label: string;
    withFooterHint: string;
    link: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        label: 'Метка',
        withFooterHint: 'Автодополнение с футером',
        link: 'Ссылка'
    },
    default: {
        label: 'Label',
        withFooterHint: 'Autocomplete with footer',
        link: 'Link'
    }
};
