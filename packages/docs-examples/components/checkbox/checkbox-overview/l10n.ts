import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the checkbox-overview example. */
export interface ExampleTranslation {
    default: string;
    checked: string;
    unchecked: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        default: 'По умолчанию',
        checked: 'Отмечен',
        unchecked: 'Не отмечен'
    },
    default: {
        default: 'Default',
        checked: 'Checked',
        unchecked: 'Unchecked'
    }
};
