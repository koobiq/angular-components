import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-add-tab-vertical example. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
