import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-overview example. */
export interface ExampleTranslation {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    dos: string;
    tabContent: (name: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        dos: 'DoS',
        tabContent: (name) => `Содержимое вкладки ${name}`
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        dos: 'DoS',
        tabContent: (name) => `${name} tab content`
    }
};
