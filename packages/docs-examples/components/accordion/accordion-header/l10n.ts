import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the accordion-header example. */
export interface ExampleTranslation {
    sectionTitle: string;
    content: string;
    toggleSectionHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
