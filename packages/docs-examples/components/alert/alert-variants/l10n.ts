import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the alert examples. */
export interface ExampleTranslation {
    body: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        body: 'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит и текст, и заголовок, ставьте точку в конце текста.'
    },
    default: {
        body: 'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.'
    }
};
