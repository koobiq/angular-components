import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-validation example. */
export interface ExampleText {
    placeholder: string;
    invalid: string;
    none: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        invalid: 'Невалидный',
        none: 'Нет'
    },
    default: {
        placeholder: 'Placeholder',
        invalid: 'Invalid',
        none: 'None'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
