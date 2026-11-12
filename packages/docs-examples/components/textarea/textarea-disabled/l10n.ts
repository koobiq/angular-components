import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleText {
    disabled: string;
    label: string;
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        disabled: 'Отключено',
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        disabled: 'Disabled',
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
