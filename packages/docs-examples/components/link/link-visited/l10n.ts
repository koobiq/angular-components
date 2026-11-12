import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleTranslation {
    scanReport: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        scanReport: 'Отчёт о сканировании'
    },
    default: {
        scanReport: 'Scan report'
    }
};
