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
    displayDelay: string;
    requestDuration: string;
    backgroundContent: string;
    backgroundContentFade: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        loadingData: 'Загрузка данных',
        creatingReport: 'Создание отчёта',
        reportProgress: '18,7 МБ из 25 МБ — осталось 2 мин',
        updating: 'Обновление...',
        updates: 'Обновления',
        refresh: 'Обновить',
        displayDelay: 'Задержка отображения',
        requestDuration: 'Длительность запроса',
        backgroundContent:
            'Содержимое под оверлеем становится едва различимым, будто скрыто в тумане. Интерфейс остаётся узнаваемым, пока идёт загрузка, но основные действия временно недоступны.',
        backgroundContentFade:
            'Оверлей органично сливается с фоном, не оставляя видимой границы по краям. Подбор цвета оверлея под поверхность сохраняет связь контейнера с окружающим интерфейсом.'
    },
    default: {
        loading: 'Loading',
        loadingData: 'Loading data',
        creatingReport: 'Creating report',
        reportProgress: '18.7 MB of 25 MB — 2 min left',
        updating: 'Updating...',
        updates: 'Updates',
        refresh: 'Refresh',
        displayDelay: 'Display delay',
        requestDuration: 'Request duration',
        backgroundContent:
            'Content behind the overlay becomes barely visible, as if hidden in fog. The interface remains recognizable while loading continues, but the main actions are temporarily unavailable.',
        backgroundContentFade:
            'The overlay blends seamlessly with the background, leaving no visible boundary around its edges. Matching the overlay color to the surface keeps the container connected to the surrounding interface.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
