import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-disabled example. */
export interface ExampleText {
    placeholder: string;
    forSelect: string;
    forOptions: string;
    forOptgroup: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        forSelect: 'Для селекта',
        forOptions: 'Для опций',
        forOptgroup: 'Для группы'
    },
    default: {
        placeholder: 'Placeholder',
        forSelect: 'For select',
        forOptions: 'For options',
        forOptgroup: 'For optgroup'
    }
};
