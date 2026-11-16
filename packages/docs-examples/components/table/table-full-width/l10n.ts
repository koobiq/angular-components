import { Translations } from '@koobiq/docs-examples/i18n';

/** Incident rows and headers of the full-width example. */
export interface ExampleTranslation {
    incident: string;
    description: string;
    type: string;
    rows: ExampleIncident[];
}

/** One incident row of the full-width example. */
export interface ExampleIncident {
    id: string;
    description: string;
    type: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        incident: 'Инцидент',
        description: 'Описание или длинный заголовок, который переносится на следующую строку',
        type: 'Тип',
        rows: [
            {
                id: 'INC–20180823–05',
                description:
                    'Одна или несколько неудачных попыток открыть VPN-подключение с 10.0.210.126 на узел 10.0.221.202 за один час',
                type: 'EXT. Использование фишинговых ресурсов (phishingAttacks)'
            },
            {
                id: 'INC–20180601–5',
                description: '10.0.64.224: среднее использование памяти за последние 5 минут: 49%',
                type: 'EXT. Смена IMSI на SIM-карте, смена IMEI на телефоне (sim)'
            },
            {
                id: 'INC–20180926–31',
                description:
                    'Зона example.com была передана с доменного DNS-сервера ns1.example.com на недоверенный узел 10.0.0.2 через AXFR-запрос',
                type: 'INT. Использование вредоносного ПО (malware)'
            },
            {
                id: 'INC–20190622–238',
                description: 'Обнаружена попытка получить список процессов, запущенных на узле ns1.example.com',
                type: 'EXT. Размещение вредоносного ресурса в Интернете (maliciousResources)'
            }
        ]
    },
    default: {
        incident: 'Incident',
        description: 'Description, or a long header text that wraps to the next line',
        type: 'Type',
        rows: [
            {
                id: 'INC–20180823–05',
                description:
                    'One or more failed attempts to open a VPN connection from 10.0.210.126 to host 10.0.221.202 within one hour',
                type: 'EXT. Use of phishing resources (phishingAttacks)'
            },
            {
                id: 'INC–20180601–5',
                description: '10.0.64.224: average memory usage over the last 5 minutes: 49% in use',
                type: 'EXT. IMSI change on the SIM card, IMEI change on the phone (sim)'
            },
            {
                id: 'INC–20180926–31',
                description:
                    'Zone example.com was transferred from the domain DNS server ns1.example.com to the untrusted host 10.0.0.2 over an AXFR request',
                type: 'INT. Use of malicious software (malware)'
            },
            {
                id: 'INC–20190622–238',
                description: 'An attempt to list the processes running on host ns1.example.com was detected',
                type: 'EXT. Hosting of a malicious resource on the Internet (maliciousResources)'
            }
        ]
    }
};
