import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-disabled example. */
export interface ExampleTranslation {
    itemLocked: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        itemLocked: 'Этот объект заблокирован и не может быть удалён'
    },
    default: {
        itemLocked: 'This item is locked and cannot be deleted'
    }
};
