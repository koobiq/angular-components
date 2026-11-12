import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the autocomplete examples. */
export interface ExampleText {
    incidentDescription: string;
    typePrefixes: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        incidentDescription: 'Описание инцидента',
        typePrefixes: 'Введите fire, thr или vul'
    },
    default: {
        incidentDescription: 'Incident description',
        typePrefixes: 'Type fire, thr or vul'
    }
};
