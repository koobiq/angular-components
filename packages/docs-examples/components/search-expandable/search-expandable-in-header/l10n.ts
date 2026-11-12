import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the search-expandable examples. */
export interface ExampleTranslation {
    panelTitle: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        panelTitle: 'Название панели'
    },
    default: {
        panelTitle: 'Panel Title'
    }
};
