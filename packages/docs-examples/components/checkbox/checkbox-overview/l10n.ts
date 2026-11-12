import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the checkbox-overview example. */
export interface ExampleText {
    default: string;
    checked: string;
    unchecked: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        default: 'По умолчанию',
        checked: 'Отмечен',
        unchecked: 'Не отмечен'
    },
    default: {
        default: 'Default',
        checked: 'Checked',
        unchecked: 'Unchecked'
    }
};
