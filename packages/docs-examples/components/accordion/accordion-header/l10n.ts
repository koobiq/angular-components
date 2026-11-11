import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the accordion-header example. */
export interface ExampleText {
    sectionTitle: string;
    content: string;
    toggleSectionHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sectionTitle: 'Текст',
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        toggleSectionHint: 'Скрытие и раскрытие секций производится по нажатию на всю секцию'
    },
    default: {
        sectionTitle: 'Text',
        content: 'This text illustrates the inner content of the accordion section',
        toggleSectionHint: 'Sections are collapsed and expanded by clicking anywhere on the section'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
