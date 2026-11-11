import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-overview example. */
export interface ExampleText {
    placeholder: string;
    label: string;
    optionN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        label: 'Метка',
        optionN: (index) => `Вариант №${index}`
    },
    default: {
        placeholder: 'Placeholder',
        label: 'Label',
        optionN: (index) => `Option #${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
