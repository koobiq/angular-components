import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleText {
    vacationPeriod: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        vacationPeriod: 'Период отпуска:'
    },
    default: {
        vacationPeriod: 'Vacation period:'
    }
};
