import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-menu example. */
export interface ExampleText {
    placeholder: string;
    style: string;
    founded: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        style: 'Стиль',
        founded: 'Основана'
    },
    default: {
        placeholder: 'Placeholder',
        style: 'Style',
        founded: 'Founded'
    }
};
