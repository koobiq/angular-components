import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the checkbox-overview example. */
export interface ExampleTranslation {
    default: string;
    big: string;
    checked: string;
    unchecked: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        default: 'По умолчанию',
        big: 'Крупный размер',
        checked: 'Отмечен',
        unchecked: 'Не отмечен'
    },
    default: {
        default: 'Default',
        big: 'Large size',
        checked: 'Checked',
        unchecked: 'Unchecked'
    }
};
