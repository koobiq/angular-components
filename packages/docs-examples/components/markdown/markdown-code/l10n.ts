import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the markdown-code example. */
export interface ExampleTranslation {
    code: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        code: 'Используйте функцию `bypassSecurityTrustHtml()`'
    },
    default: {
        code: 'Use the `bypassSecurityTrustHtml()` function'
    }
};
