import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-no-variants example. */
export interface ExampleText {
    emptySelect: string;
    noOptions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        emptySelect: 'Пустой селект',
        noOptions: 'Нет вариантов выбора'
    },
    default: {
        emptySelect: 'Empty select',
        noOptions: 'No options to select'
    }
};
