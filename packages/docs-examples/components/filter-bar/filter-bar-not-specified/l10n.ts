import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the not-specified example; the option is worded to agree with the name of the filter. */
export interface ExampleText {
    name: string;
    notSpecified: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Тип атаки',
        notSpecified: 'Не указан'
    },
    default: {
        name: 'Attack Type',
        notSpecified: 'Not specified'
    }
};
