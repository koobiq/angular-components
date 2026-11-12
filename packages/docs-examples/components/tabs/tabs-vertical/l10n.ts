import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-vertical example. */
export interface ExampleText {
    complexAttack: string;
    hipsAlert: string;
    idsIpsAlert: string;
    vulnExploitation: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
