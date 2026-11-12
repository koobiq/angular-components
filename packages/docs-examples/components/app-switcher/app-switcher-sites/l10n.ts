import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown around the app switcher in the examples. The sites and apps stay the same in every locale. */
export interface ExampleText {
    /** Name and tooltip of the trigger. */
    allApps: string;
    /** Caption of the selected application. */
    app: string;
    /** Caption of the selected site. */
    site: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        allApps: 'Все приложения',
        app: 'Приложение:',
        site: 'Площадка:'
    },
    default: {
        allApps: 'All apps',
        app: 'App:',
        site: 'Site:'
    }
};
