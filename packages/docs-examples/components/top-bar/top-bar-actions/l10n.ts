import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleTranslation {
    actions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        actions: 'Действия'
    },
    default: {
        actions: 'Actions'
    }
};
