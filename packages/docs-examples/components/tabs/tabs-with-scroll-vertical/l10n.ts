import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-with-scroll-vertical example. */
export interface ExampleTranslation {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
    idsIpsAlert: string;
    zeroDay: string;
    xss: string;
    malware: string;
    tabContent: (name: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        hipsAlert: 'HIPS-алерт',
        idsIpsAlert: 'IDS/IPS-алерт',
        zeroDay: 'Эксплойт нулевого дня',
        xss: 'XSS',
        malware: 'Вредоносное ПО',
        tabContent: (name) => `Содержимое вкладки ${name}`
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        hipsAlert: 'HIPS alert',
        idsIpsAlert: 'IDS/IPS Alert',
        zeroDay: 'Zero-Day Exploit',
        xss: 'XSS',
        malware: 'Malware',
        tabContent: (name) => `${name} tab content`
    }
};
