import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the list examples. */
export interface ExampleText {
    selected: string;
    items: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        selected: 'Выбрано:',
        items: 'Пункты'
    },
    default: {
        selected: 'Selected:',
        items: 'Items'
    }
};
