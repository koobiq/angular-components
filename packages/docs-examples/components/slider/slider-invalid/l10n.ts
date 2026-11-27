import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    label: string;
    error: (limit: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        label: 'Время ожидания, мин',
        error: (limit) => `Время ожидания не должно превышать ${limit} мин.`
    },
    'en-US': {
        label: 'Timeout, min',
        error: (limit) => `Timeout must be ${limit} minutes or less.`
    }
};
