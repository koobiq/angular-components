import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-locale-configuration example. */
export interface ExampleText {
    placeholder: string;
    defaultStrings: string;
    overriddenInstance: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
