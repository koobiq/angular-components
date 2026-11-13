import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-overview example. */
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
