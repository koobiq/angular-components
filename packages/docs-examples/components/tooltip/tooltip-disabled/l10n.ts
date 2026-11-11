import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-disabled example. */
export interface ExampleText {
    itemLocked: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        itemLocked: 'Этот объект заблокирован и не может быть удалён'
    },
    default: {
        itemLocked: 'This item is locked and cannot be deleted'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
