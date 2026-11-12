import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-add-new-option example. */
export interface ExampleTranslation {
    loginAccount: string;
    privilegeEscalationAccount: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loginAccount: 'Учётная запись',
        privilegeEscalationAccount: 'Учётная запись для повышения привилегий'
    },
    default: {
        loginAccount: 'Login account',
        privilegeEscalationAccount: 'Account for privilege escalation'
    }
};
