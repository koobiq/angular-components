import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the form field examples. */
export interface ExampleTranslation {
    email: string;
    emailHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        email: 'Эл. почта',
        emailHint: 'Используется для входа и получения уведомлений'
    },
    default: {
        email: 'Email',
        emailHint: 'Used to sign in and to receive notifications'
    }
};
