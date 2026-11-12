import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-locale-configuration example. */
export interface ExampleTranslation {
    placeholder: string;
    defaultStrings: string;
    overriddenInstance: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        defaultStrings: 'Строки по умолчанию',
        overriddenInstance: 'Переопределено только для этого экземпляра'
    },
    default: {
        placeholder: 'Placeholder',
        defaultStrings: 'Default strings',
        overriddenInstance: 'Overridden for this instance only'
    }
};
