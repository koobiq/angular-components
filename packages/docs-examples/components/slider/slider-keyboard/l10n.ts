import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    regular: string;
    reversed: string;
    discrete: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        regular: 'Обычная шкала',
        reversed: 'Обратная шкала',
        discrete: 'Шаг по отметкам',
        bounds: ['Нижняя граница', 'Верхняя граница']
    },
    'en-US': {
        regular: 'Standard scale',
        reversed: 'Reversed scale',
        discrete: 'Step between marks',
        bounds: ['Lower bound', 'Upper bound']
    }
};
