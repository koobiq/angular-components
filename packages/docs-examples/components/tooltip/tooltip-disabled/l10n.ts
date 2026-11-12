import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-disabled example. */
export interface ExampleText {
    itemLocked: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        itemLocked: 'Этот объект заблокирован и не может быть удалён'
    },
    default: {
        itemLocked: 'This item is locked and cannot be deleted'
    }
};
