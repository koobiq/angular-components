import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-disabled example. */
export interface ExampleText {
    placeholder: string;
    optionN: (index: number) => string;
    groupN: (index: number) => string;
    forSelect: string;
    forOptions: string;
    forOptgroup: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        optionN: (index) => `Вариант №${index}`,
        groupN: (index) => `Группа №${index}`,
        forSelect: 'Для селекта',
        forOptions: 'Для опций',
        forOptgroup: 'Для группы'
    },
    default: {
        placeholder: 'Placeholder',
        optionN: (index) => `Option #${index}`,
        groupN: (index) => `Group #${index}`,
        forSelect: 'For select',
        forOptions: 'For options',
        forOptgroup: 'For optgroup'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
