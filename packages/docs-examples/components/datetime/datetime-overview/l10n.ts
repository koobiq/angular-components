import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datetime overview example. */
export interface ExampleTranslation {
    label: string;
    hint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        label: 'Дата и время релиза',
        hint: 'В вашем часовом поясе'
    },
    default: {
        label: 'Release date and time',
        hint: 'In your local time zone'
    }
};
