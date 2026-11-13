import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tabs examples. OS names (macOS, Windows) stay as proper names. */
export interface ExampleTranslation {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS'
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS'
    }
};
