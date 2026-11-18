import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the title-overview example. */
export interface ExampleTranslation {
    justText: string;
    andLongText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        justText: 'Просто текст',
        andLongText: ' и длинный текст'
    },
    default: {
        justText: 'Just a text',
        andLongText: ' and a long text'
    }
};
