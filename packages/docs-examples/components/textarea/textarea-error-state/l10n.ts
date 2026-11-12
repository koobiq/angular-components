import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleText {
    label: string;
    placeholder: string;
    hint10: string;
    min10: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        label: 'Метка',
        placeholder: 'Плейсхолдер',
        hint10: 'Введите не менее 10 символов',
        min10: 'Минимум 10 символов'
    },
    default: {
        label: 'Label',
        placeholder: 'Placeholder',
        hint10: 'Please enter at least 10 characters',
        min10: 'Minimum 10 characters'
    }
};
