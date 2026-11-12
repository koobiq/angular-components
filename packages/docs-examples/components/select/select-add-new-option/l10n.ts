import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-add-new-option example. */
export interface ExampleText {
    loginAccount: string;
    privilegeEscalationAccount: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loginAccount: 'Учётная запись',
        privilegeEscalationAccount: 'Учётная запись для повышения привилегий'
    },
    default: {
        loginAccount: 'Login account',
        privilegeEscalationAccount: 'Account for privilege escalation'
    }
};
