import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-disabled example. */
export interface ExampleText {
    placeholder: string;
    forSelect: string;
    forOptions: string;
    forOptgroup: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        forSelect: 'Для селекта',
        forOptions: 'Для опций',
        forOptgroup: 'Для группы'
    },
    default: {
        placeholder: 'Placeholder',
        forSelect: 'For select',
        forOptions: 'For options',
        forOptgroup: 'For optgroup'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
