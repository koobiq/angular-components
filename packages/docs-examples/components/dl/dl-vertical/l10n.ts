import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dl-vertical example. */
export interface ExampleText {
    incidentType: string;
    malwareInfection: string;
    identifier: string;
    status: string;
    new: string;
    assignee: string;
    description: string;
    phishingDescription: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        identifier: 'Идентификатор',
        status: 'Статус',
        new: 'Новый',
        assignee: 'Исполнитель',
        description: 'Описание',
        phishingDescription:
            'Сотрудник открыл вложение в фишинговом письме, и файл выполнил вредоносный код на рабочей станции.'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        identifier: 'Identifier',
        status: 'Status',
        new: 'New',
        assignee: 'Assignee',
        description: 'Description',
        phishingDescription:
            'An employee opened an attachment in a phishing email, and the file ran malicious code on the workstation.'
    }
};
