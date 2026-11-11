import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-vertical example. */
export interface ExampleText {
    complexAttack: string;
    hipsAlert: string;
    idsIpsAlert: string;
    vulnExploitation: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        complexAttack: 'Сложная атака',
        hipsAlert: 'HIPS-алерт',
        idsIpsAlert: 'IDS/IPS-алерт',
        vulnExploitation: 'Эксплуатация уязвимости'
    },
    default: {
        complexAttack: 'Complex Attack',
        hipsAlert: 'HIPS alert',
        idsIpsAlert: 'IDS/IPS Alert',
        vulnExploitation: 'Vulnerability Exploitation'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
