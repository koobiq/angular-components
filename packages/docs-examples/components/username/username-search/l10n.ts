import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the username examples. Person names and logins stay as proper nouns. */
export interface ExampleText {
    assignee: string;
    nothingFound: string;
    compact: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        assignee: 'Исполнитель',
        nothingFound: 'Ничего не найдено',
        compact: 'Компактно'
    },
    default: {
        assignee: 'Assignee',
        nothingFound: 'Nothing found',
        compact: 'Compact'
    }
};
