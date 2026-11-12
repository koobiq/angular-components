import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the autocomplete-with-footer example. */
export interface ExampleTranslation {
    label: string;
    withFooterHint: string;
    link: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
