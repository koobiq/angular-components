import { Translations } from '@koobiq/docs-examples/i18n';

/** Incident type options of the select-all example. */
export interface ExampleTranslation {
    incidentTypes: string;
    options: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        incidentTypes: 'Типы инцидентов',
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
        incidentTypes: 'Incident types',
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
