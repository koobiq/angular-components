import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dropdown-item-action example. */
export interface ExampleText {
    rulesSettings: string;
    hashSumSettings: string;
    moreActions: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        rulesSettings: 'Настройки правил',
        hashSumSettings: 'Настройки хеш-суммы',
        moreActions: 'Другие действия'
    },
    default: {
        rulesSettings: 'Rules settings',
        hashSumSettings: 'Hash sum settings',
        moreActions: 'More actions'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
