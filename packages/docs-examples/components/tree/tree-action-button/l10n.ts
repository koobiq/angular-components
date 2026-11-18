import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleTranslation {
    badge: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        badge: 'бейдж'
    },
    default: {
        badge: 'badge'
    }
};
