import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleText {
    learnMore: string;
    aboutScanReports: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        learnMore: 'Узнайте больше',
        aboutScanReports: 'об отчётах о сканировании'
    },
    default: {
        learnMore: 'Learn more',
        aboutScanReports: 'about scan reports'
    }
};
