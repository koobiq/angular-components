import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleTranslation {
    vacationPeriod: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        vacationPeriod: 'Период отпуска:'
    },
    default: {
        vacationPeriod: 'Vacation period:'
    }
};
