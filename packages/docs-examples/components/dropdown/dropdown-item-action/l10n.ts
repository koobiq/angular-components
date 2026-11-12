import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-item-action example. */
export interface ExampleTranslation {
    rulesSettings: string;
    hashSumSettings: string;
    moreActions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
