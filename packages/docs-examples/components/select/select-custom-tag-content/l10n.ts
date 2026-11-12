import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-custom-tag-content example. */
export interface ExampleText {
    placeholder: string;
    severities: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        severities: ['Критическая', 'Значительная', 'Незначительная', 'Информация']
    },
    default: {
        placeholder: 'Placeholder',
        severities: ['Critical', 'Major', 'Minor', 'Info']
    }
};
