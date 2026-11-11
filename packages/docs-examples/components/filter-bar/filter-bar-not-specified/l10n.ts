import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the not-specified example; the option is worded to agree with the name of the filter. */
export interface ExampleText {
    name: string;
    notSpecified: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': { name: 'Тип атаки', notSpecified: 'Не указан' },
    default: { name: 'Attack Type', notSpecified: 'Not specified' }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
