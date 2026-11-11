import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dl-long-text example. */
export interface ExampleText {
    longDescription: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        longDescription:
            'Сотрудник открыл вложение security_update.exe в фишинговом письме. Файл выполнил вредоносный код на рабочей станции.'
    },
    default: {
        longDescription:
            'An employee opened the security_update.exe attachment in a phishing email. The file executed malicious code on the workstation.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
