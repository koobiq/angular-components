import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dl-width-sync example. */
export interface ExampleText {
    incidentType: string;
    malwareInfection: string;
    bruteForceAttack: string;
    identifier: string;
    assignee: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        bruteForceAttack: 'Атака перебором',
        identifier: 'Идентификатор',
        assignee: 'Исполнитель'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        bruteForceAttack: 'Brute-force attack',
        identifier: 'Identifier',
        assignee: 'Assignee'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
