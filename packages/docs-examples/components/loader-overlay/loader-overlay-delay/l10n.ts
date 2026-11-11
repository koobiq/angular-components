import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the loader-overlay-delay example. */
export interface ExampleText {
    updating: string;
    updates: string;
    refresh: string;
    displayDelay: string;
    requestDuration: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
