import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-menu example. */
export interface ExampleText {
    placeholder: string;
    style: string;
    founded: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        style: 'Стиль',
        founded: 'Основана'
    },
    default: {
        placeholder: 'Placeholder',
        style: 'Style',
        founded: 'Founded'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
