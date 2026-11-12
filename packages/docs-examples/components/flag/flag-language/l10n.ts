import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleText {
    selectLanguage: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        selectLanguage: 'Выберите язык'
    },
    default: {
        selectLanguage: 'Select your language'
    }
};
