import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-extended example. */
export interface ExampleTranslation {
    confidence: string;
    incidentType: string;
    detected: string;
    updated: string;
    extendedTypes: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        confidence: 'Уверенность',
        incidentType: 'Тип инцидента',
        detected: 'Обнаружен',
        updated: 'Обновлён',
        extendedTypes: [
            'Заражение вредоносным ПО',
            'Фишинговая атака',
            'Утечка данных',
            'Атака DoS/DDoS'
        ]
    },
    default: {
        confidence: 'Confidence',
        incidentType: 'Incident Type',
        detected: 'Detected',
        updated: 'Updated',
        extendedTypes: ['Malware Infection', 'Phishing Attack', 'Data Breach', 'DoS/DDoS Attack']
    }
};
