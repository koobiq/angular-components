import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-scroll example. */
export interface ExampleText {
    openModal: string;
    itemN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openModal: 'Открыть модалку',
        itemN: (index) => `Пункт №${index}`
    },
    default: {
        openModal: 'Open Modal',
        itemN: (index) => `Item #${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
