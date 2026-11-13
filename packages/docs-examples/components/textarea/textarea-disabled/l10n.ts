import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the textarea examples. */
export interface ExampleTranslation {
    disabled: string;
    label: string;
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        disabled: 'Отключено',
        label: 'Метка',
        placeholder: 'Плейсхолдер'
    },
    default: {
        disabled: 'Disabled',
        label: 'Label',
        placeholder: 'Placeholder'
    }
};
