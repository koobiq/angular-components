import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the content panel examples. */
export interface ExampleText {
    toggle: string;
    open: string;
    close: string;
    title: string;
    copyLink: string;
    expand: string;
    button: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        toggle: 'Переключить',
        open: 'Открыть',
        close: 'Закрыть',
        title: 'Заголовок',
        copyLink: 'Копировать ссылку',
        expand: 'Развернуть',
        button: (index) => `Кнопка ${index}`
    },
    default: {
        toggle: 'Toggle',
        open: 'Open',
        close: 'Close',
        title: 'Title',
        copyLink: 'Copy link',
        expand: 'Expand',
        button: (index) => `Button ${index}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
