import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-custom-tag-content example. */
export interface ExampleTranslation {
    placeholder: string;
    severities: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        severities: ['Критическая', 'Значительная', 'Незначительная', 'Информация']
    },
    default: {
        placeholder: 'Placeholder',
        severities: ['Critical', 'Major', 'Minor', 'Info']
    }
};
