import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-add-tab-vertical example. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
