import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the checkbox-validation example. */
export interface ExampleTranslation {
    acceptTerms: string;
    validationHint: string;
    validationError: string;
    continue: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        acceptTerms: 'Я принимаю условия лицензионного соглашения',
        validationHint: 'Продолжите, не принимая условия, чтобы увидеть ошибку',
        validationError: 'Примите условия, чтобы продолжить',
        continue: 'Продолжить'
    },
    default: {
        acceptTerms: 'I accept the terms of the license agreement',
        validationHint: 'Continue without accepting to see the error',
        validationError: 'Accept the terms to continue',
        continue: 'Continue'
    }
};
