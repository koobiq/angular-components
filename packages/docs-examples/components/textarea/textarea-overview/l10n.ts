import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleText {
    label: string;
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
