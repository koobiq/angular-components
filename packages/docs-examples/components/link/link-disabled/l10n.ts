import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the link-disabled example. */
export interface ExampleText {
    scanReport: string;
    disabled: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        scanReport: 'Отчёт о сканировании',
        disabled: 'Отключено'
    },
    default: {
        scanReport: 'Scan report',
        disabled: 'Disabled'
    }
};
