import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        bounds: ['Нижняя граница', 'Верхняя граница']
    },
    'en-US': {
        bounds: ['Lower bound', 'Upper bound']
    }
};
