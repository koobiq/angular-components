import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-menu example. */
export interface ExampleTranslation {
    placeholder: string;
    style: string;
    founded: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        style: 'Стиль',
        founded: 'Основана'
    },
    default: {
        placeholder: 'Placeholder',
        style: 'Style',
        founded: 'Founded'
    }
};
