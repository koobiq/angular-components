import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-overview example. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    dos: string;
    tabContent: (name: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
