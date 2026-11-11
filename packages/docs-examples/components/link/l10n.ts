import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleText {
    scanReportInApp: string;
    scanReport: string;
    scanHistory: string;
    learnMore: string;
    aboutScanReports: string;
    agree: string;
    licenseTerms: string;
    disabled: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        scanReportInApp: 'Отчёт о сканировании в AI Desktop',
        scanReport: 'Отчёт о сканировании',
        scanHistory: 'История сканирований',
        learnMore: 'Узнайте больше',
        aboutScanReports: 'об отчётах о сканировании',
        agree: 'Я полностью согласен',
        licenseTerms: 'с условиями лицензионного соглашения',
        disabled: 'Отключено'
    },
    default: {
        scanReportInApp: 'Scan report in AI Desktop',
        scanReport: 'Scan report',
        scanHistory: 'Scan history',
        learnMore: 'Learn more',
        aboutScanReports: 'about scan reports',
        agree: 'I fully agree',
        licenseTerms: 'with the terms of the license agreement',
        disabled: 'Disabled'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
