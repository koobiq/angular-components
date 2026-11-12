import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the select examples. Account names, network addresses and durations stay as-is. */
export interface ExampleText {
    placeholder: string;
    nothingFound: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        nothingFound: 'Ничего не найдено'
    },
    default: {
        placeholder: 'Placeholder',
        nothingFound: 'Nothing found'
    }
};
