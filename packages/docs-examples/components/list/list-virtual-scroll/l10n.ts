import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the list-virtual-scroll example. */
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
