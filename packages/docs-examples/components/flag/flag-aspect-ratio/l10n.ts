import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleText {
    selectCountry: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        selectCountry: 'Выберите страну'
    },
    default: {
        selectCountry: 'Select a country'
    }
};
