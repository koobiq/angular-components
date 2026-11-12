import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tree examples. Club and country names stay as proper nouns. */
export interface ExampleText {
    badge: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        badge: 'бейдж'
    },
    default: {
        badge: 'badge'
    }
};
