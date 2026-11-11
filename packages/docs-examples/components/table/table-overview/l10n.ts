import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the table-overview example. */
export interface ExampleText {
    events: string[];
    client: string;
    event: string;
    registered: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        events: [
            'Кража учётных данных',
            'DDoS',
            'HIPS-алерт',
            'Спам-атака',
            'Эксплуатация уязвимости',
            'Сложная атака'
        ],
        client: 'Клиент',
        event: 'Событие',
        registered: 'Зарегистрирован'
    },
    default: {
        events: ['Identity Theft', 'DDoS', 'HIPS Alert', 'Spam Attack', 'Vulnerability Exploitation', 'Complex Attack'],
        client: 'Client',
        event: 'Event',
        registered: 'Registered'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
