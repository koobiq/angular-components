import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-cross-field-dates example. */
export interface ExampleText {
    validFrom: string;
    validUntil: string;
    periodEndBeforeStart: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        validFrom: 'Действует с',
        validUntil: 'Действует до',
        periodEndBeforeStart: 'Конец периода не может быть раньше его начала'
    },
    default: {
        validFrom: 'Valid from',
        validUntil: 'Valid until',
        periodEndBeforeStart: 'The end of the period must not precede its start'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
