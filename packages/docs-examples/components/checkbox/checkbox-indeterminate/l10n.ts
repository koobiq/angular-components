import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the checkbox examples. */
export interface ExampleTranslation {
    allEventTypes: string;
    eventTypes: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        allEventTypes: 'Все типы событий',
        eventTypes: ['Вредоносное ПО', 'Фишинг', 'Программа-вымогатель']
    },
    default: {
        allEventTypes: 'All event types',
        eventTypes: ['Malware', 'Phishing', 'Ransomware']
    }
};
