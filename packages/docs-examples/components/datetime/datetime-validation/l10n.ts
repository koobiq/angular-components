import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datetime validation example. */
export interface ExampleTranslation {
    label: string;
    required: string;
    incomplete: string;
    notEarlier: (dateTime: string) => string;
    notLater: (dateTime: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        label: 'Начало работ',
        required: 'Обязательно',
        incomplete: 'Введите дату и время',
        notEarlier: (dateTime) => `Не раньше ${dateTime}`,
        notLater: (dateTime) => `Не позже ${dateTime}`
    },
    default: {
        label: 'Maintenance start',
        required: 'Required',
        incomplete: 'Enter both the date and the time',
        notEarlier: (dateTime) => `Not earlier than ${dateTime}`,
        notLater: (dateTime) => `Not later than ${dateTime}`
    }
};
