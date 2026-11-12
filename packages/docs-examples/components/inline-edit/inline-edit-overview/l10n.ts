import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-overview example. */
export interface ExampleText {
    placeholder: string;
    label: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        label: 'Метка'
    },
    default: {
        placeholder: 'Placeholder',
        label: 'Label'
    }
};
