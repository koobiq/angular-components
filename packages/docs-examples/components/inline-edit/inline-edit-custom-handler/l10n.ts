import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the inline-edit examples. Person names, role ids and permission ids stay as-is. */
export interface ExampleTranslation {
    placeholder: string;
    label: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        label: 'Метка'
    },
    default: {
        placeholder: 'Placeholder',
        label: 'Label'
    }
};
