import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-label example. */
export interface ExampleText {
    label: string;
    clickLabelForFocus: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        label: 'Метка',
        clickLabelForFocus: 'Нажмите на метку для автофокуса'
    },
    default: {
        label: 'Label',
        clickLabelForFocus: 'Click on the label for auto focus'
    }
};
