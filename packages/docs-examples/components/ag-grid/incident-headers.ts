import type { Translations } from '@koobiq/docs-examples/i18n';
import type { ExampleSecurityIncident } from './security-incidents';

export type ExampleIncidentHeaders = Record<Exclude<keyof ExampleSecurityIncident, 'hosts'>, string>;

export const EXAMPLE_INCIDENT_HEADERS = {
    'ru-RU': {
        id: 'ID инцидента',
        event: 'Событие',
        connection: 'Связь с узлом',
        aiVerdict: 'Вердикт ИИ',
        assignee: 'Ответственный',
        severity: 'Важность',
        status: 'Статус',
        affectedHost: 'Затронутый узел',
        category: 'Категория',
        detectedAt: 'Время обнаружения',
        sourceIp: 'IP-адрес источника',
        destinationIp: 'IP-адрес назначения',
        subnet: 'Подсеть узла',
        protocol: 'Протокол',
        port: 'Порт',
        detector: 'Источник обнаружения',
        description: 'Описание',
        process: 'Процесс',
        pid: 'PID',
        filePath: 'Путь к файлу',
        fileSize: 'Размер файла',
        techniques: 'MITRE ATT&CK'
    },
    default: {
        id: 'Incident ID',
        event: 'Event',
        connection: 'Host connection',
        aiVerdict: 'AI verdict',
        assignee: 'Assignee',
        severity: 'Severity',
        status: 'Status',
        affectedHost: 'Affected host',
        category: 'Category',
        detectedAt: 'Detected at',
        sourceIp: 'Source IP',
        destinationIp: 'Destination IP',
        subnet: 'Host subnet',
        protocol: 'Protocol',
        port: 'Port',
        detector: 'Detected by',
        description: 'Description',
        process: 'Process',
        pid: 'PID',
        filePath: 'File path',
        fileSize: 'File size',
        techniques: 'MITRE ATT&CK'
    }
} satisfies Translations<ExampleIncidentHeaders>;
