import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Incident type options of the select-all example. */
export interface ExampleText {
    options: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        options: [
            'Компрометация учётной записи',
            'Утечка данных',
            'Отказ в обслуживании (DoS)',
            'Внутренняя угроза',
            'Заражение вредоносным ПО',
            'Атака «человек посередине»',
            'Фишинг',
            'Повышение привилегий'
        ]
    },
    default: {
        options: [
            'Account Compromise',
            'Data Breach',
            'Denial of Service (DoS)',
            'Insider Threat',
            'Malware Infection',
            'Man-in-the-Middle Attack',
            'Phishing',
            'Privilege Escalation'
        ]
    }
};

/** Options of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
