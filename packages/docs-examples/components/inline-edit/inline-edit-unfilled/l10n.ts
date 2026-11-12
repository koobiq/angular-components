import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-unfilled example. */
export interface ExampleTranslation {
    empty: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        empty: 'Пусто'
    },
    default: {
        empty: 'Empty'
    }
};
