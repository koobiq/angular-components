import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-text-only example. */
export interface ExampleTranslation {
    noInfo: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        noInfo: 'Нет информации'
    },
    default: {
        noInfo: 'No information'
    }
};
