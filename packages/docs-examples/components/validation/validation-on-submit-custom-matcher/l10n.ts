import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the validation examples. */
export interface ExampleText {
    name: string;
    lastName: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия'
    },
    default: {
        name: 'Name',
        lastName: 'Last name'
    }
};
