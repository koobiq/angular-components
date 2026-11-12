import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-fieldset-with-button example. */
export interface ExampleText {
    longLegend: string;
    save: string;
    longHintButton: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        longLegend: 'Длинное имя поля, которое переносится на новую строку и располагается даже над кнопкой.',
        save: 'Сохранить',
        longHintButton:
            'Длинный текст подсказки под полем, который переносится на новую строку и даже простирается под кнопкой.'
    },
    default: {
        longLegend: 'A long field name that wraps to a new line and is positioned even above the button.',
        save: 'Save',
        longHintButton: 'A long hint text under the field that wraps to a new line and even extends beneath the button.'
    }
};
