import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-locale-configuration example. */
export interface ExampleText {
    placeholder: string;
    defaultStrings: string;
    overriddenInstance: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
