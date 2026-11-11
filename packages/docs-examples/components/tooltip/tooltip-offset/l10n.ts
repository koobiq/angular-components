import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-offset example. */
export interface ExampleText {
    tooltip: string;
    default: string;
    defaultWithArrow: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        tooltip: 'Тултип',
        default: 'По умолчанию',
        defaultWithArrow: 'По умолчанию со стрелкой'
    },
    default: {
        tooltip: 'Tooltip',
        default: 'Default',
        defaultWithArrow: 'Default with arrow'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
