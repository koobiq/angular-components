import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the checkbox examples. */
export interface ExampleText {
    allEventTypes: string;
    eventTypes: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        allEventTypes: 'Все типы событий',
        eventTypes: ['Вредоносное ПО', 'Фишинг', 'Программа-вымогатель']
    },
    default: {
        allEventTypes: 'All event types',
        eventTypes: ['Malware', 'Phishing', 'Ransomware']
    }
};
