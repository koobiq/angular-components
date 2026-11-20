import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    value: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        value: 'Значение',
        bounds: ['Нижняя граница', 'Верхняя граница']
    },
    'en-US': {
        value: 'Value',
        bounds: ['Lower bound', 'Upper bound']
    }
};
