import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the form-field-with-label example. */
export interface ExampleText {
    label: string;
    clickLabelForFocus: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        label: 'Метка',
        clickLabelForFocus: 'Нажмите на метку для автофокуса'
    },
    default: {
        label: 'Label',
        clickLabelForFocus: 'Click on the label for auto focus'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
