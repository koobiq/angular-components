import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleTranslation {
    label: string;
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
