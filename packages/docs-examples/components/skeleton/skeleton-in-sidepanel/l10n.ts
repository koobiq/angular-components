import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-in-sidepanel example. */
export interface ExampleTranslation {
    openSidepanel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        openSidepanel: 'Открыть панель'
    },
    default: {
        openSidepanel: 'Open sidepanel'
    }
};
