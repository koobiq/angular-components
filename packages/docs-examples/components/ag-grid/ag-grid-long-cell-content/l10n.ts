import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Event rows and column headers of the long-cell-content example. */
export interface ExampleText {
    events: ExampleEvent[];
    eventHeader: string;
    hostsHeader: string;
    techniquesHeader: string;
    statusHeader: string;
    collapseLink: string;
    moreCount: (count: number) => string;
    allCount: (count: number) => string;
}

/** One event of the long-cell-content example grid. */
export interface ExampleEvent {
    event: string;
    hosts: string[];
    techniques: string[];
    status: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        events: [
            {
                event: 'Подбор пароля',
                hosts: ['srv-01', 'srv-02', 'srv-03', 'srv-04', 'srv-05', 'srv-06', 'srv-07'],
                techniques: ['T1110', 'T1110.001', 'T1110.003', 'T1110.004', 'T1078', 'T1021.004'],
                status: 'В работе'
            },
            {
                event: 'Сканирование портов',
                hosts: ['gw-01'],
                techniques: ['T1046'],
                status: 'Закрыто'
            },
            {
                event: 'Обнаружено вредоносное ПО',
                hosts: ['ws-12', 'ws-15', 'ws-21'],
                techniques: ['T1566.001', 'T1204.002', 'T1027'],
                status: 'Закрыто'
            },
            {
                event: 'Обфусцированный скрипт',
                hosts: ['ws-03', 'ws-04'],
                techniques: ['T1059.001', 'T1027.010', 'T1140'],
                status: 'В работе'
            },
            {
                event: 'Утечка данных',
                hosts: ['db-01', 'db-02', 'db-03', 'db-04', 'db-05', 'db-06', 'db-07', 'db-08', 'db-09'],
                techniques: ['T1567.002', 'T1048', 'T1030', 'T1041', 'T1020'],
                status: 'Новое'
            },
            {
                event: 'DNS-туннелирование',
                hosts: ['dns-01', 'dns-02'],
                techniques: ['T1071.004', 'T1572'],
                status: 'Новое'
            },
            {
                event: 'Повышение привилегий',
                hosts: ['ws-01', 'ws-02', 'ws-05', 'ws-06', 'ws-08', 'ws-09'],
                techniques: ['T1098', 'T1078.002', 'T1078.003', 'T1021.002'],
                status: 'В работе'
            },
            {
                event: 'Фишинговое письмо',
                hosts: ['mail-01', 'mail-02', 'mail-03', 'mail-04'],
                techniques: ['T1566.002', 'T1598.003', 'T1056.003', 'T1583.001'],
                status: 'Закрыто'
            }
        ],
        eventHeader: 'Событие',
        hostsHeader: 'Узлы',
        techniquesHeader: 'Техники',
        statusHeader: 'Статус',
        collapseLink: 'Свернуть',
        moreCount: (count) => `${count} еще`,
        allCount: (count) => `Все ${count}`
    },
    default: {
        events: [
            {
                event: 'Brute force',
                hosts: ['srv-01', 'srv-02', 'srv-03', 'srv-04', 'srv-05', 'srv-06', 'srv-07'],
                techniques: ['T1110', 'T1110.001', 'T1110.003', 'T1110.004', 'T1078', 'T1021.004'],
                status: 'In progress'
            },
            {
                event: 'Port scan',
                hosts: ['gw-01'],
                techniques: ['T1046'],
                status: 'Closed'
            },
            {
                event: 'Malware detected',
                hosts: ['ws-12', 'ws-15', 'ws-21'],
                techniques: ['T1566.001', 'T1204.002', 'T1027'],
                status: 'Closed'
            },
            {
                event: 'Obfuscated script',
                hosts: ['ws-03', 'ws-04'],
                techniques: ['T1059.001', 'T1027.010', 'T1140'],
                status: 'In progress'
            },
            {
                event: 'Data exfiltration',
                hosts: ['db-01', 'db-02', 'db-03', 'db-04', 'db-05', 'db-06', 'db-07', 'db-08', 'db-09'],
                techniques: ['T1567.002', 'T1048', 'T1030', 'T1041', 'T1020'],
                status: 'New'
            },
            {
                event: 'DNS tunneling',
                hosts: ['dns-01', 'dns-02'],
                techniques: ['T1071.004', 'T1572'],
                status: 'New'
            },
            {
                event: 'Privilege escalation',
                hosts: ['ws-01', 'ws-02', 'ws-05', 'ws-06', 'ws-08', 'ws-09'],
                techniques: ['T1098', 'T1078.002', 'T1078.003', 'T1021.002'],
                status: 'In progress'
            },
            {
                event: 'Phishing email',
                hosts: ['mail-01', 'mail-02', 'mail-03', 'mail-04'],
                techniques: ['T1566.002', 'T1598.003', 'T1056.003', 'T1583.001'],
                status: 'Closed'
            }
        ],
        eventHeader: 'Event',
        hostsHeader: 'Hosts',
        techniquesHeader: 'Techniques',
        statusHeader: 'Status',
        collapseLink: 'Collapse',
        moreCount: (count) => `${count} more`,
        allCount: (count) => `All ${count}`
    }
};
