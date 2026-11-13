import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the timezone examples. */
export interface ExampleTranslation {
    nothingFound: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        nothingFound: 'Ничего не найдено'
    },
    default: {
        nothingFound: 'Nothing found'
    }
};
