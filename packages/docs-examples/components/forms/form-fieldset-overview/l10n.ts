import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the form-fieldset-overview example. */
export interface ExampleText {
    fieldGroupTitle: string;
    ipAddress: string;
    longHint1: string;
    hint2: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fieldGroupTitle: 'Название группы полей',
        ipAddress: 'IP-адрес',
        longHint1:
            'Подсказка для первого поля. Длинный текст подсказки под полем, который переносится на новую строку и занимает всю ширину группы',
        hint2: 'Подсказка для второго поля'
    },
    default: {
        fieldGroupTitle: 'Field group title',
        ipAddress: 'IP-address',
        longHint1:
            'Hint for the first field. A long hint text below the field that wraps to a new line and spans the full width of the group',
        hint2: 'Hint for the second field'
    }
};
