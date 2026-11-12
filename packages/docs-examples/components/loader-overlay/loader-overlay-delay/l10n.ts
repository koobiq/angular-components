import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the loader-overlay-delay example. */
export interface ExampleTranslation {
    updating: string;
    updates: string;
    refresh: string;
    displayDelay: string;
    requestDuration: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        updating: 'Обновление...',
        updates: 'Обновления',
        refresh: 'Обновить',
        displayDelay: 'Задержка отображения',
        requestDuration: 'Длительность запроса'
    },
    default: {
        updating: 'Updating...',
        updates: 'Updates',
        refresh: 'Refresh',
        displayDelay: 'Display delay',
        requestDuration: 'Request duration'
    }
};
