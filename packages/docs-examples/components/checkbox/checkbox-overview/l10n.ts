import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the checkbox-overview example. */
export interface ExampleText {
    default: string;
    checked: string;
    unchecked: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        default: 'По умолчанию',
        checked: 'Отмечен',
        unchecked: 'Не отмечен'
    },
    default: {
        default: 'Default',
        checked: 'Checked',
        unchecked: 'Unchecked'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
