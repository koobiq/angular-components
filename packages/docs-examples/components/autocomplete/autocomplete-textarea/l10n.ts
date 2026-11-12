import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the autocomplete examples. */
export interface ExampleTranslation {
    incidentDescription: string;
    typePrefixes: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        incidentDescription: 'Описание инцидента',
        typePrefixes: 'Введите fire, thr или vul'
    },
    default: {
        incidentDescription: 'Incident description',
        typePrefixes: 'Type fire, thr or vul'
    }
};
