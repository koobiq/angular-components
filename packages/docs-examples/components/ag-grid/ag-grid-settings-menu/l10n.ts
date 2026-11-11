import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-settings-menu example. */
export interface ExampleText {
    affectedHost: string;
    severity: string;
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

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        affectedHost: 'Затронутый узел',
        severity: 'Важность',
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
        affectedHost: 'Affected host',
        severity: 'Severity',
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
