import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleTranslation {
    trigger: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        trigger: 'триггер периода'
    },
    default: {
        trigger: 'time range trigger'
    }
};
