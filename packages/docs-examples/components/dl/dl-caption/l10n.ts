import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the dl-caption example. */
export interface ExampleTranslation {
    incidentType: string;
    malwareInfection: string;
    identifier: string;
    description: string;
    phishingDescription: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        identifier: 'Идентификатор',
        description: 'Описание',
        phishingDescription:
            'Сотрудник открыл вложение в фишинговом письме, и файл выполнил вредоносный код на рабочей станции.'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        identifier: 'Identifier',
        description: 'Description',
        phishingDescription:
            'An employee opened an attachment in a phishing email, and the file ran malicious code on the workstation.'
    }
};
