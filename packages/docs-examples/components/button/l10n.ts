import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the button examples. */
export interface ExampleText {
    button: string;
    buttonText: string;
    longButtonText: string;
    truncatedButtonText: string;
    archive: string;
    report: string;
    snooze: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        button: 'Кнопка',
        buttonText: 'Текст кнопки',
        longButtonText: 'Очень длинный текст кнопки',
        truncatedButtonText: 'Очень длинный текст кнопки, который обрезается по ширине',
        archive: 'Архив',
        report: 'Отчёт',
        snooze: 'Отложить'
    },
    default: {
        button: 'Button',
        buttonText: 'Button text',
        longButtonText: 'Very long button text',
        truncatedButtonText: 'Very long button text that gets truncated by width',
        archive: 'Archive',
        report: 'Report',
        snooze: 'Snooze'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
