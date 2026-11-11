import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-validation example. */
export interface ExampleText {
    placeholder: string;
    optionN: (index: number) => string;
    invalid: string;
    none: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        optionN: (index) => `Вариант №${index}`,
        invalid: 'Невалидный',
        none: 'Нет'
    },
    default: {
        placeholder: 'Placeholder',
        optionN: (index) => `Option #${index}`,
        invalid: 'Invalid',
        none: 'None'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
