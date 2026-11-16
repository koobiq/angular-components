import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the highlight examples. Search demo data (Cube articles, clubs) stays English so the queries match. */
export interface ExampleTranslation {
    chooseClub: string;
    nothingFound: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        chooseClub: 'Выберите клуб',
        nothingFound: 'Ничего не найдено'
    },
    default: {
        chooseClub: 'Choose a club',
        nothingFound: 'Nothing found'
    }
};
