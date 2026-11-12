import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the flag examples. Fictional country names (Gondor, Wakanda) stay as-is. */
export interface ExampleText {
    circleCountries: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        circleCountries: ['Ангола', 'Малайзия', 'Уругвай']
    },
    default: {
        circleCountries: ['Angola', 'Malaysia', 'Uruguay']
    }
};
