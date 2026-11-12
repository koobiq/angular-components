import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-footer example. */
export interface ExampleText {
    button: string;
    caption: string;
    link: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        button: 'Кнопка',
        caption: 'Подпись',
        link: 'Ссылка'
    },
    default: {
        button: 'Button',
        caption: 'Caption',
        link: 'Link'
    }
};
