import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the footer-overview example. */
export interface ExampleTranslation {
    link: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        link: 'Ссылка'
    },
    default: {
        link: 'Link'
    }
};
