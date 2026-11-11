import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the time-range examples. */
export interface ExampleText {
    placeholder: string;
    events: string;
    withPresets: string;
    withoutPresets: string;
    trigger: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Период',
        events: 'События',
        withPresets: 'С предустановками',
        withoutPresets: 'Без предустановок',
        trigger: 'триггер периода'
    },
    default: {
        placeholder: 'Period',
        events: 'Events',
        withPresets: 'With presets',
        withoutPresets: 'Without presets',
        trigger: 'time range trigger'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
