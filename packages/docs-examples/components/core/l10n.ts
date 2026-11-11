import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the core examples. */
export interface ExampleText {
    currentTheme: string;
    switchTheme: string;
    pickTheme: string;
    day: string;
    night: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        currentTheme: 'Текущая тема:',
        switchTheme: 'Переключить тему',
        pickTheme: 'Выберите тему',
        day: 'День',
        night: 'Ночь'
    },
    default: {
        currentTheme: 'Current theme:',
        switchTheme: 'Switch theme',
        pickTheme: 'Pick a theme',
        day: 'Day',
        night: 'Night'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
