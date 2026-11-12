import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-scrolling-and-layering-page example. */
export interface ExampleTranslation {
    pageTitle: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        pageTitle: 'Заголовок страницы'
    },
    default: {
        pageTitle: 'Page Title'
    }
};
