import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-disable-close example. */
export interface ExampleTranslation {
    close: string;
    open: string;
    sidepanel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        sidepanel: 'Панель'
    },
    default: {
        close: 'Close',
        open: 'Open',
        sidepanel: 'Sidepanel'
    }
};
