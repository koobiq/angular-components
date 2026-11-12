import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-item-action example. */
export interface ExampleText {
    rulesSettings: string;
    hashSumSettings: string;
    moreActions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
