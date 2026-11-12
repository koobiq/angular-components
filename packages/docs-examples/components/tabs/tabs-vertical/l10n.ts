import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-vertical example. */
export interface ExampleTranslation {
    complexAttack: string;
    hipsAlert: string;
    idsIpsAlert: string;
    vulnExploitation: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
