import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-monospace example. */
export interface ExampleTranslation {
    copyHash: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': { copyHash: 'Копировать хеш' },
    default: { copyHash: 'Copy hash' }
};
