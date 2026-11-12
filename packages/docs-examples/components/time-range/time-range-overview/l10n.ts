import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleTranslation {
    events: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        events: 'События'
    },
    default: {
        events: 'Events'
    }
};
