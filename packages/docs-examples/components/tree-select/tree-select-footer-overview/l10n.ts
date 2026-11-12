import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the footer-overview example. */
export interface ExampleText {
    link: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        link: 'Ссылка'
    },
    default: {
        link: 'Link'
    }
};
