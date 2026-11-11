import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-controls example. */
export interface ExampleText {
    placeholder: string;
    textField: string;
    textarea: string;
    selectMultiple: string;
    select: string;
    optionN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        textField: 'Текстовое поле',
        textarea: 'Текстовая область',
        selectMultiple: 'Множественный выбор',
        select: 'Список',
        optionN: (index) => `Вариант №${index}`
    },
    default: {
        placeholder: 'Placeholder',
        textField: 'Text Field',
        textarea: 'Textarea',
        selectMultiple: 'Select Multiple',
        select: 'Select',
        optionN: (index) => `Option #${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
