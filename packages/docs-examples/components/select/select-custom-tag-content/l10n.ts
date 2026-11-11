import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-custom-tag-content example. */
export interface ExampleText {
    placeholder: string;
    severities: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        severities: ['Критическая', 'Значительная', 'Незначительная', 'Информация']
    },
    default: {
        placeholder: 'Placeholder',
        severities: ['Critical', 'Major', 'Minor', 'Info']
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
