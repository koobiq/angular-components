import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the timezone examples. */
export interface ExampleText {
    nothingFound: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        nothingFound: 'Ничего не найдено'
    },
    default: {
        nothingFound: 'Nothing found'
    }
};
