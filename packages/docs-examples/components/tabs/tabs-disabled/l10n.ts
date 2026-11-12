import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tabs examples. OS names (macOS, Windows) stay as proper names. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    dos: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        dos: 'DoS'
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        dos: 'DoS'
    }
};
