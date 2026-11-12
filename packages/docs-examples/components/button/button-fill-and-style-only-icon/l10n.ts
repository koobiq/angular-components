import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the button-fill-and-style-only-icon example. */
export interface ExampleTranslation {
    add: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        add: 'Добавить'
    },
    default: {
        add: 'Add'
    }
};
