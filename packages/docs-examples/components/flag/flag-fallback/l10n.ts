import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleText {
    fallbackCountries: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fallbackCountries: ['Албания', 'Гондор', 'Кракозия', 'Перу', 'Ваканда']
    },
    default: {
        fallbackCountries: ['Albania', 'Gondor', 'Krakozhia', 'Peru', 'Wakanda']
    }
};
