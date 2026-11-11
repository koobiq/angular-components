import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the toast examples. */
export interface ExampleText {
    restore: string;
    cancel: string;
    agentUpdateAvailable: string;
    version20315: string;
    importFiles: string;
    refresh: string;
    showToast: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        restore: 'Восстановить',
        cancel: 'Отмена',
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        importFiles: 'Импорт файлов',
        refresh: 'Обновить',
        showToast: 'Показать тост'
    },
    default: {
        restore: 'Restore',
        cancel: 'Cancel',
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        importFiles: 'Importing files',
        refresh: 'Refresh',
        showToast: 'Show toast'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
