import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    scenarios: Record<'none' | 'swap' | 'push', string>;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        scenarios: { none: 'Ограничение периода', swap: 'Перестановка границ', push: 'Сдвиг окна' },
        bounds: ['Нижняя граница', 'Верхняя граница']
    },
    'en-US': {
        scenarios: { none: 'Limit a period', swap: 'Swap boundaries', push: 'Shift a window' },
        bounds: ['Lower bound', 'Upper bound']
    }
};
