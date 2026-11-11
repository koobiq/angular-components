import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the input-number-overview example. */
export interface ExampleText {
    numberWithBounds: string;
    hintBounds: string;
    numberWithSeparator: string;
    numberWithoutSeparator: string;
    integer: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        numberWithBounds: 'С разделением групп разрядов, с мин. и макс. ограничением',
        hintBounds: 'От −12 000 до 12 000',
        numberWithSeparator: 'С разделителем групп разрядов',
        numberWithoutSeparator: 'Без разделителя групп разрядов',
        integer: 'Целочисленное значение'
    },
    default: {
        numberWithBounds: 'With thousand separators, with min and max bounds',
        hintBounds: 'From −12,000 to 12,000',
        numberWithSeparator: 'With thousand separator',
        numberWithoutSeparator: 'Without thousand separator',
        integer: 'Integer value'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
