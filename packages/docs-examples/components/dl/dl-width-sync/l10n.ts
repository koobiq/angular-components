import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dl-width-sync example. */
export interface ExampleText {
    incidentType: string;
    malwareInfection: string;
    identifier: string;
    assignee: string;
    bruteForceAttack: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        identifier: 'Идентификатор',
        assignee: 'Исполнитель',
        bruteForceAttack: 'Атака перебором'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        identifier: 'Identifier',
        assignee: 'Assignee',
        bruteForceAttack: 'Brute-force attack'
    }
};
