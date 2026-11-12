import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleText {
    add: string;
    create: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        add: 'Добавить',
        create: 'Создать'
    },
    default: {
        add: 'Add',
        create: 'Create'
    }
};
