import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dl-long-text example. */
export interface ExampleText {
    longDescription: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        longDescription:
            'Сотрудник открыл вложение security_update.exe в фишинговом письме. Файл выполнил вредоносный код на рабочей станции.'
    },
    default: {
        longDescription:
            'An employee opened the security_update.exe attachment in a phishing email. The file executed malicious code on the workstation.'
    }
};
