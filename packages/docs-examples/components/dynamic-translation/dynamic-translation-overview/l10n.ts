import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the dynamic translation examples. */
export interface ExampleTranslation {
    message: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        message: 'Инцидент создан. [[link:Откройте в новой вкладке]], чтобы продолжить работу.'
    },
    default: {
        message: 'Incident created. [[link:Open in a new tab]] to continue working.'
    }
};
