import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the markdown-code example. */
export interface ExampleText {
    code: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        code: 'Используйте функцию `bypassSecurityTrustHtml()`'
    },
    default: {
        code: 'Use the `bypassSecurityTrustHtml()` function'
    }
};
