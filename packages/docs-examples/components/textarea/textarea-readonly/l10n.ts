import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleTranslation {
    readonly: string;
    label: string;
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        readonly: 'Только для чтения',
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        readonly: 'Readonly',
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
