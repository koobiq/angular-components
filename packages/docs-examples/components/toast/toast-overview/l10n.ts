import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the toast examples. */
export interface ExampleTranslation {
    agentUpdateAvailable: string;
    version20315: string;
    refresh: string;
    showToast: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        refresh: 'Обновить',
        showToast: 'Показать тост'
    },
    default: {
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        refresh: 'Refresh',
        showToast: 'Show toast'
    }
};
