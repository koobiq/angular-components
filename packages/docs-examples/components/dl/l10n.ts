import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the description list examples. Person names (John Smith, Jane Doe) stay as proper nouns. */
export interface ExampleText {
    incidentType: string;
    malwareInfection: string;
    bruteForceAttack: string;
    identifier: string;
    status: string;
    new: string;
    assignee: string;
    description: string;
    phishingDescription: string;
    longDescription: string;
    severity: string;
    tags: string;
    critical: string;
    tagPhishing: string;
    tagMalware: string;
    tagWorkstation: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        bruteForceAttack: 'Атака перебором',
        identifier: 'Идентификатор',
        status: 'Статус',
        new: 'Новый',
        assignee: 'Исполнитель',
        description: 'Описание',
        phishingDescription:
            'Сотрудник открыл вложение в фишинговом письме, и файл выполнил вредоносный код на рабочей станции.',
        longDescription:
            'Сотрудник открыл вложение security_update.exe в фишинговом письме. Файл выполнил вредоносный код на рабочей станции.',
        severity: 'Важность',
        tags: 'Теги',
        critical: 'Критический',
        tagPhishing: 'Фишинг',
        tagMalware: 'Вредоносное ПО',
        tagWorkstation: 'Рабочая станция'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        bruteForceAttack: 'Brute-force attack',
        identifier: 'Identifier',
        status: 'Status',
        new: 'New',
        assignee: 'Assignee',
        description: 'Description',
        phishingDescription:
            'An employee opened an attachment in a phishing email, and the file ran malicious code on the workstation.',
        longDescription:
            'An employee opened the security_update.exe attachment in a phishing email. The file executed malicious code on the workstation.',
        severity: 'Severity',
        tags: 'Tags',
        critical: 'Critical',
        tagPhishing: 'Phishing',
        tagMalware: 'Malware',
        tagWorkstation: 'Workstation'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
