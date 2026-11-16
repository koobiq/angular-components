import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the link-disabled example. */
export interface ExampleTranslation {
    scanReport: string;
    disabled: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        scanReport: 'Отчёт о сканировании',
        disabled: 'Отключено'
    },
    default: {
        scanReport: 'Scan report',
        disabled: 'Disabled'
    }
};
