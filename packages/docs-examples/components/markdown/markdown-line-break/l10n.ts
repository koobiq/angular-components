import { Translations } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleTranslation {
    lineBreak: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        lineBreak: `Первая строка  
Вторая строка`
    },
    default: {
        lineBreak: `First line  
Second line`
    }
};
