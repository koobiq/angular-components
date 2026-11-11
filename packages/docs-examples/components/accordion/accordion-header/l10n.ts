import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the accordion-header example. */
export interface ExampleText {
    sectionTitle: string;
    content: string;
    boltSection: (section: number) => string;
    bugSection: (section: number) => string;
    moreSection: (section: number) => string;
    toggleSectionHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sectionTitle: 'Текст',
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        boltSection: (section) => `Молния, секция ${section}`,
        bugSection: (section) => `Ошибка, секция ${section}`,
        moreSection: (section) => `Ещё, секция ${section}`,
        toggleSectionHint: 'Скрытие и раскрытие секций производится по нажатию на всю секцию'
    },
    default: {
        sectionTitle: 'Text',
        content: 'This text illustrates the inner content of the accordion section',
        boltSection: (section) => `Bolt, section ${section}`,
        bugSection: (section) => `Bug, section ${section}`,
        moreSection: (section) => `More, section ${section}`,
        toggleSectionHint: 'Sections are collapsed and expanded by clicking anywhere on the section'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
