import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the form-field-with-hint example. */
export interface ExampleTranslation {
    articleTitle: string;
    maxChars: (max: number, count: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        articleTitle: 'Заголовок статьи',
        maxChars: (max, count) => `Максимум ${max} символов (${count}/${max})`
    },
    default: {
        articleTitle: 'Article title',
        maxChars: (max, count) => `Max ${max} chars (${count}/${max})`
    }
};
