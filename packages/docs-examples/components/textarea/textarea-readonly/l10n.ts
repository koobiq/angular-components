import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleText {
    readonly: string;
    label: string;
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        readonly: 'Только для чтения',
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        readonly: 'Readonly',
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
