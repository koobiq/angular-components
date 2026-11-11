import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-add-new-option example. */
export interface ExampleText {
    loginAccount: string;
    privilegeEscalationAccount: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loginAccount: 'Учётная запись',
        privilegeEscalationAccount: 'Учётная запись для повышения привилегий'
    },
    default: {
        loginAccount: 'Login account',
        privilegeEscalationAccount: 'Account for privilege escalation'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
