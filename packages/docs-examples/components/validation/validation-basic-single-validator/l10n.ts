import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleText {
    name: string;
    required: string;
    submit: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Имя',
        required: 'Обязательно',
        submit: 'Отправить'
    },
    default: {
        name: 'Name',
        required: 'Required',
        submit: 'Submit'
    }
};
