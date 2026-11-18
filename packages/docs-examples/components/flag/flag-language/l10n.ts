import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleTranslation {
    selectLanguage: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        selectLanguage: 'Выберите язык'
    },
    default: {
        selectLanguage: 'Select your language'
    }
};
