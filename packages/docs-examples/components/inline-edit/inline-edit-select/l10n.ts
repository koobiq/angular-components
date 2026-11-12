import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-select example. */
export interface ExampleText {
    assignee: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        assignee: 'Исполнитель'
    },
    default: {
        assignee: 'Assignee'
    }
};
