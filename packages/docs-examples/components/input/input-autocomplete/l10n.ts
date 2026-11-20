import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-autocomplete example. */
export interface ExampleTranslation {
    withAutocomplete: string;
    withoutAutocomplete: string;
    emailPlaceholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        withAutocomplete: 'Email (с автозаполнением)',
        withoutAutocomplete: 'Email (без автозаполнения)',
        emailPlaceholder: 'Введите email'
    },
    default: {
        withAutocomplete: 'Email (with autocomplete)',
        withoutAutocomplete: 'Email (without autocomplete)',
        emailPlaceholder: 'Enter email'
    }
};
