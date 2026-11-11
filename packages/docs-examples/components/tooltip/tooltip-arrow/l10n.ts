import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-arrow example. */
export interface ExampleText {
    tooltipWithoutArrow: string;
    tooltipWithArrow: string;
    noArrow: string;
    withArrow: string;
    tooltipWithCenteredArrow: string;
    centeredArrow: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        tooltipWithoutArrow: 'Тултип без стрелки',
        tooltipWithArrow: 'Тултип со стрелкой',
        noArrow: 'Без стрелки',
        withArrow: 'Со стрелкой',
        tooltipWithCenteredArrow: 'Тултип с центрированной стрелкой',
        centeredArrow: 'Центрированная стрелка'
    },
    default: {
        tooltipWithoutArrow: 'Tooltip without arrow',
        tooltipWithArrow: 'Tooltip with arrow',
        noArrow: 'No arrow',
        withArrow: 'With arrow',
        tooltipWithCenteredArrow: 'Tooltip with centered arrow',
        centeredArrow: 'Centered arrow'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
