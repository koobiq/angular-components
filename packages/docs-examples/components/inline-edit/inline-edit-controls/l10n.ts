import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-controls example. */
export interface ExampleText {
    placeholder: string;
    textField: string;
    textarea: string;
    selectMultiple: string;
    select: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        textField: 'Текстовое поле',
        textarea: 'Текстовая область',
        selectMultiple: 'Множественный выбор',
        select: 'Список'
    },
    default: {
        placeholder: 'Placeholder',
        textField: 'Text Field',
        textarea: 'Textarea',
        selectMultiple: 'Select Multiple',
        select: 'Select'
    }
};
