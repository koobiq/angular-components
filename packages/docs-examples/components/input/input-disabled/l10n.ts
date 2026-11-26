import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-disabled example. */
export interface ExampleTranslation {
    empty: string;
    filled: string;
    name: string;
    filledName: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': { empty: 'Empty', filled: 'Filled', name: 'Имя', filledName: 'Александр' },
    default: { empty: 'Empty', filled: 'Filled', name: 'Name', filledName: 'Alexander' }
};
