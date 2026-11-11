import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the loader-overlay examples. */
export interface ExampleText {
    loading: string;
    loadingData: string;
    creatingReport: string;
    reportProgress: string;
    updating: string;
    updates: string;
    refresh: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        loadingData: 'Загрузка данных',
        creatingReport: 'Создание отчёта',
        reportProgress: '18,7 МБ из 25 МБ — осталось 2 мин',
        updating: 'Обновление...',
        updates: 'Обновления',
        refresh: 'Обновить'
    },
    default: {
        loading: 'Loading',
        loadingData: 'Loading data',
        creatingReport: 'Creating report',
        reportProgress: '18.7 MB of 25 MB — 2 min left',
        updating: 'Updating...',
        updates: 'Updates',
        refresh: 'Refresh'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
