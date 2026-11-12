import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the timepicker examples. */
export interface ExampleTranslation {
    required: string;
    minIs: (time: string) => string;
    maxIs: (time: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        required: 'Обязательно',
        minIs: (time) => `Минимум ${time}`,
        maxIs: (time) => `Максимум ${time}`
    },
    default: {
        required: 'Required',
        minIs: (time) => `Min is ${time}`,
        maxIs: (time) => `Maximum is ${time}`
    }
};
