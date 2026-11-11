import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-extended example. */
export interface ExampleText {
    confidence: string;
    incidentType: string;
    detected: string;
    updated: string;
    extendedTypes: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
