import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-label-and-hint example. */
export interface ExampleTranslation {
    label: string;
    hint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': { label: 'Название поля', hint: 'Подсказка под полем' },
    default: { label: 'Field label', hint: 'Hint below the field' }
};
