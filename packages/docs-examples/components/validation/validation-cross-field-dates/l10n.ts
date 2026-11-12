import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-cross-field-dates example. */
export interface ExampleText {
    validFrom: string;
    validUntil: string;
    periodEndBeforeStart: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
