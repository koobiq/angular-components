import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-autocomplete example. */
export interface ExampleTranslation {
    withAutocomplete: string;
    withoutAutocomplete: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        withAutocomplete: 'Email (с автозаполнением)',
        withoutAutocomplete: 'Email (без автозаполнения)'
    },
    default: {
        withAutocomplete: 'Email (with autocomplete)',
        withoutAutocomplete: 'Email (without autocomplete)'
    }
};
