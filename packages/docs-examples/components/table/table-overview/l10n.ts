import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the table-overview example. */
export interface ExampleText {
    events: string[];
    client: string;
    event: string;
    registered: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
