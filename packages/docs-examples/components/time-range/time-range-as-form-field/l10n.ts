import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleTranslation {
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Период'
    },
    default: {
        placeholder: 'Period'
    }
};
