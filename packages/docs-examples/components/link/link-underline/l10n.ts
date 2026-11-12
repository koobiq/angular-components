import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleText {
    scanReport: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        scanReport: 'Отчёт о сканировании'
    },
    default: {
        scanReport: 'Scan report'
    }
};
