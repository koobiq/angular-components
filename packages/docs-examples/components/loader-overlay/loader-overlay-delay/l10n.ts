import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the loader-overlay-delay example. */
export interface ExampleText {
    updating: string;
    updates: string;
    refresh: string;
    displayDelay: string;
    requestDuration: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
