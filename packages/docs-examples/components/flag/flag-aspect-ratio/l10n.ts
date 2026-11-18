import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleTranslation {
    selectCountry: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        selectCountry: 'Выберите страну'
    },
    default: {
        selectCountry: 'Select a country'
    }
};
