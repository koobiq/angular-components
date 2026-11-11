import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-interactive example. */
export interface ExampleText {
    tooltip: string;
    buttonWithTooltip: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        tooltip: 'Тултип',
        buttonWithTooltip: 'Кнопка с тултипом'
    },
    default: {
        tooltip: 'Tooltip',
        buttonWithTooltip: 'Button with a tooltip'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
