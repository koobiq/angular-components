import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-add-tab example. */
export interface ExampleTranslation {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        hipsAlert: 'HIPS-алерт'
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        hipsAlert: 'HIPS alert'
    }
};
