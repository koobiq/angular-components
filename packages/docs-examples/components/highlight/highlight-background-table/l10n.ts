import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the highlight examples. Search demo data (Cube articles, clubs) stays English so the queries match. */
export interface ExampleTranslation {
    city: string;
    company: string;
    person: string;
    notes: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        city: 'Город',
        company: 'Компания',
        person: 'Контакт',
        notes: 'Заметки'
    },
    default: {
        city: 'City',
        company: 'Company',
        person: 'Person',
        notes: 'Notes'
    }
};
