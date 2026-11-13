import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the badge examples. Color and size names (Theme, Fade Error, Compact) stay English as API names. */
export interface ExampleTranslation {
    badge: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        badge: 'Бейдж'
    },
    default: {
        badge: 'Badge'
    }
};
