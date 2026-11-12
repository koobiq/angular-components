import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown around the app switcher in the examples. The sites and apps stay the same in every locale. */
export interface ExampleTranslation {
    /** Name and tooltip of the trigger. */
    allApps: string;
    /** Caption of the selected application. */
    app: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        allApps: 'Все приложения',
        app: 'Приложение:'
    },
    default: {
        allApps: 'All apps',
        app: 'App:'
    }
};
