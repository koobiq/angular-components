import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    value: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        value: 'Значение'
    },
    'en-US': {
        value: 'Value'
    }
};
