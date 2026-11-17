import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-settings-menu example. */
export interface ExampleTranslation {
    severity: string;
    affectedHost: string;
    status: string;
    sourceIp: string;
    incidentId: string;
    attackType: string;
    density: string;
    compact: string;
    normal: string;
    severities: string[];
    statuses: string[];
    attackTypes: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        severity: 'Важность',
        affectedHost: 'Затронутый узел',
        status: 'Статус',
        sourceIp: 'IP-адрес источника',
        incidentId: 'ID инцидента',
        attackType: 'Тип атаки',
        density: 'Плотность',
        compact: 'Компактно',
        normal: 'Обычно',
        severities: ['Низкая', 'Средняя', 'Высокая', 'Критическая'],
        statuses: ['Новый', 'В работе', 'Решён'],
        attackTypes: ['Подбор пароля', 'Фишинг', 'Сканирование портов', 'Вредоносное ПО', 'DNS-туннелирование']
    },
    default: {
        severity: 'Severity',
        affectedHost: 'Affected host',
        status: 'Status',
        sourceIp: 'Source IP',
        incidentId: 'Incident ID',
        attackType: 'Attack type',
        density: 'Density',
        compact: 'Compact',
        normal: 'Normal',
        severities: ['Low', 'Medium', 'High', 'Critical'],
        statuses: ['New', 'In progress', 'Resolved'],
        attackTypes: ['Brute force', 'Phishing', 'Port scan', 'Malware', 'DNS tunneling']
    }
};
