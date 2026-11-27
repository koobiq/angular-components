import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tree-select-custom-tag-content example. */
export interface ExampleTranslation {
    placeholder: string;
    severities: string[];
    removeItem: (value: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        severities: ['Критическая', 'Значительная', 'Незначительная', 'Информация'],
        removeItem: (value: string) => `Удалить ${value}`
    },
    default: {
        placeholder: 'Placeholder',
        severities: ['Critical', 'Major', 'Minor', 'Info'],
        removeItem: (value: string) => `Remove ${value}`
    }
};
