import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datetime example with seconds. */
export interface ExampleTranslation {
    label: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        label: 'Время события'
    },
    default: {
        label: 'Event time'
    }
};
