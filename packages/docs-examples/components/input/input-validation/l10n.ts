import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-validation example. */
export interface ExampleTranslation {
    valid: string;
    invalid: string;
    name: string;
    required: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': { valid: 'Valid', invalid: 'Invalid', name: 'Имя', required: 'Обязательное поле' },
    default: { valid: 'Valid', invalid: 'Invalid', name: 'Name', required: 'Required field' }
};
