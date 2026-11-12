import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-hide-with-timeout example. */
export interface ExampleTranslation {
    diamond: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        diamond: 'Ромб'
    },
    default: {
        diamond: 'Diamond'
    }
};
