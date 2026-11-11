import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** One incident of the row-detail example grid. */
export interface ExampleIncident {
    id: string;
    event: string;
    severity: string;
    status: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    port: string;
    technique: string;
    host: string;
    detector: string;
    description: string;
}

/** Incident rows of the row-detail example. */
export interface ExampleText {
    incidents: ExampleIncident[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        incidents: [
            {
                id: 'INC-1001',
                event: 'Подбор пароля',
                severity: 'Высокая',
                status: 'В работе',
                sourceIp: '203.0.113.24',
                destinationIp: '10.0.1.10',
                protocol: 'SSH',
                port: '22',
                technique: 'T1110',
                host: 'srv-01',
                detector: 'IDS',
                description: '15 неудачных попыток входа по SSH за две минуты, затем одна успешная.'
            },
            {
                id: 'INC-1002',
                event: 'Сканирование портов',
                severity: 'Низкая',
                status: 'Решён',
                sourceIp: '198.51.100.7',
                destinationIp: '10.0.0.1',
                protocol: 'TCP',
                port: '1-1024',
                technique: 'T1046',
                host: 'gw-01',
                detector: 'Межсетевой экран',
                description: 'Источник опросил 1024 TCP-порта за 40 секунд.'
            },
            {
                id: 'INC-1003',
                event: 'Фишинговое письмо',
                severity: 'Средняя',
                status: 'Решён',
                sourceIp: '192.0.2.15',
                destinationIp: '10.0.2.5',
                protocol: 'SMTP',
                port: '25',
                technique: 'T1566.001',
                host: 'mail-01',
                detector: 'Почтовый шлюз',
                description: 'Письмо с поддельным отправителем и вложением с макросами дошло до 12 почтовых ящиков.'
            },
            {
                id: 'INC-1004',
                event: 'Обнаружено вредоносное ПО',
                severity: 'Критическая',
                status: 'В работе',
                sourceIp: '203.0.113.91',
                destinationIp: '10.0.3.12',
                protocol: 'HTTPS',
                port: '443',
                technique: 'T1204.002',
                host: 'ws-12',
                detector: 'EDR',
                description: 'Антивирус поместил в карантин троян, который загрузил браузер.'
            },
            {
                id: 'INC-1005',
                event: 'DNS-туннелирование',
                severity: 'Высокая',
                status: 'Новый',
                sourceIp: '198.51.100.33',
                destinationIp: '10.0.0.53',
                protocol: 'DNS',
                port: '53',
                technique: 'T1071.004',
                host: 'dns-01',
                detector: 'Мониторинг DNS',
                description: 'Более 3000 длинных случайных поддоменов одного домена разрешены за час.'
            },
            {
                id: 'INC-1006',
                event: 'Повышение привилегий',
                severity: 'Критическая',
                status: 'Новый',
                sourceIp: '192.0.2.48',
                destinationIp: '10.0.0.10',
                protocol: 'LDAP',
                port: '389',
                technique: 'T1098',
                host: 'dc-01',
                detector: 'SIEM',
                description: 'Пользователь добавлен в группу Domain Admins вне окна изменений.'
            },
            {
                id: 'INC-1007',
                event: 'Утечка данных',
                severity: 'Критическая',
                status: 'В работе',
                sourceIp: '10.0.4.20',
                destinationIp: '203.0.113.150',
                protocol: 'HTTPS',
                port: '443',
                technique: 'T1567',
                host: 'db-01',
                detector: 'DLP',
                description: '4,2 ГБ выгружены на неизвестный внешний узел вне рабочих часов.'
            },
            {
                id: 'INC-1008',
                event: 'Обфусцированный скрипт',
                severity: 'Средняя',
                status: 'Новый',
                sourceIp: '198.51.100.62',
                destinationIp: '10.0.3.3',
                protocol: 'WinRM',
                port: '5986',
                technique: 'T1027',
                host: 'ws-03',
                detector: 'EDR',
                description: 'PowerShell выполнил закодированную в Base64 команду, отключающую журналирование скриптов.'
            }
        ]
    },
    default: {
        incidents: [
            {
                id: 'INC-1001',
                event: 'Brute force',
                severity: 'High',
                status: 'In progress',
                sourceIp: '203.0.113.24',
                destinationIp: '10.0.1.10',
                protocol: 'SSH',
                port: '22',
                technique: 'T1110',
                host: 'srv-01',
                detector: 'IDS',
                description: '15 failed SSH logins within two minutes, followed by a successful one.'
            },
            {
                id: 'INC-1002',
                event: 'Port scan',
                severity: 'Low',
                status: 'Resolved',
                sourceIp: '198.51.100.7',
                destinationIp: '10.0.0.1',
                protocol: 'TCP',
                port: '1-1024',
                technique: 'T1046',
                host: 'gw-01',
                detector: 'Firewall',
                description: 'The source probed 1,024 TCP ports in 40 seconds.'
            },
            {
                id: 'INC-1003',
                event: 'Phishing email',
                severity: 'Medium',
                status: 'Resolved',
                sourceIp: '192.0.2.15',
                destinationIp: '10.0.2.5',
                protocol: 'SMTP',
                port: '25',
                technique: 'T1566.001',
                host: 'mail-01',
                detector: 'Mail gateway',
                description: 'An email with a spoofed sender and a macro-enabled attachment reached 12 mailboxes.'
            },
            {
                id: 'INC-1004',
                event: 'Malware detected',
                severity: 'Critical',
                status: 'In progress',
                sourceIp: '203.0.113.91',
                destinationIp: '10.0.3.12',
                protocol: 'HTTPS',
                port: '443',
                technique: 'T1204.002',
                host: 'ws-12',
                detector: 'EDR',
                description: 'The antivirus quarantined a trojan that a browser had downloaded.'
            },
            {
                id: 'INC-1005',
                event: 'DNS tunneling',
                severity: 'High',
                status: 'New',
                sourceIp: '198.51.100.33',
                destinationIp: '10.0.0.53',
                protocol: 'DNS',
                port: '53',
                technique: 'T1071.004',
                host: 'dns-01',
                detector: 'DNS monitoring',
                description: 'Over 3,000 long random subdomains of a single domain were resolved within an hour.'
            },
            {
                id: 'INC-1006',
                event: 'Privilege escalation',
                severity: 'Critical',
                status: 'New',
                sourceIp: '192.0.2.48',
                destinationIp: '10.0.0.10',
                protocol: 'LDAP',
                port: '389',
                technique: 'T1098',
                host: 'dc-01',
                detector: 'SIEM',
                description: 'A user was added to the Domain Admins group outside the change window.'
            },
            {
                id: 'INC-1007',
                event: 'Data exfiltration',
                severity: 'Critical',
                status: 'In progress',
                sourceIp: '10.0.4.20',
                destinationIp: '203.0.113.150',
                protocol: 'HTTPS',
                port: '443',
                technique: 'T1567',
                host: 'db-01',
                detector: 'DLP',
                description: '4.2 GB were uploaded to an unknown external host outside business hours.'
            },
            {
                id: 'INC-1008',
                event: 'Obfuscated script',
                severity: 'Medium',
                status: 'New',
                sourceIp: '198.51.100.62',
                destinationIp: '10.0.3.3',
                protocol: 'WinRM',
                port: '5986',
                technique: 'T1027',
                host: 'ws-03',
                detector: 'EDR',
                description: 'PowerShell ran a Base64-encoded command that disables script logging.'
            }
        ]
    }
};

/** Incident rows of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
