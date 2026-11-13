import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleTranslation {
    scanReportInApp: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        scanReportInApp: 'Отчёт о сканировании в AI Desktop'
    },
    default: {
        scanReportInApp: 'Scan report in AI Desktop'
    }
};
