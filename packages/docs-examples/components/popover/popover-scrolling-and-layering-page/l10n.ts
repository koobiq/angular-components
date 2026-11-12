import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-scrolling-and-layering-page example. */
export interface ExampleText {
    pageTitle: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        pageTitle: 'Заголовок страницы'
    },
    default: {
        pageTitle: 'Page Title'
    }
};
