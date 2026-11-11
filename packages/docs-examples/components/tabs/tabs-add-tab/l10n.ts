import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-add-tab example. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    hipsAlert: string;
    tabN: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        hipsAlert: 'HIPS-алерт',
        tabN: (index) => `Вкладка ${index}`
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        hipsAlert: 'HIPS alert',
        tabN: (index) => `Tab ${index}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
