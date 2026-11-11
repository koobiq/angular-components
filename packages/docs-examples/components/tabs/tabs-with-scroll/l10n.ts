import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-with-scroll example. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
    idsIpsAlert: string;
    zeroDay: string;
    xss: string;
    malware: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        hipsAlert: 'HIPS-алерт',
        idsIpsAlert: 'IDS/IPS-алерт',
        zeroDay: 'Эксплойт нулевого дня',
        xss: 'XSS',
        malware: 'Вредоносное ПО'
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        hipsAlert: 'HIPS alert',
        idsIpsAlert: 'IDS/IPS Alert',
        zeroDay: 'Zero-Day Exploit',
        xss: 'XSS',
        malware: 'Malware'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
