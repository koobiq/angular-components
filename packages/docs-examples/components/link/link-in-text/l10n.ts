import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleTranslation {
    learnMore: string;
    aboutScanReports: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        learnMore: 'Узнайте больше',
        aboutScanReports: 'об отчётах о сканировании'
    },
    default: {
        learnMore: 'Learn more',
        aboutScanReports: 'about scan reports'
    }
};
