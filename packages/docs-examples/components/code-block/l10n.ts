import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    lineNumbers: string;
    filled: string;
    alwaysShowActionbar: string;
    showAll: string;
    wordWrap: string;
    hideTabs: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        lineNumbers: 'Нумерация строк',
        filled: 'Заливка',
        alwaysShowActionbar: 'Всегда показывать панель действий',
        showAll: 'Показать всё',
        wordWrap: 'Перенос строк',
        hideTabs: 'Скрыть вкладки'
    },
    default: {
        lineNumbers: 'Line numbers',
        filled: 'Filled',
        alwaysShowActionbar: 'Always show actionbar',
        showAll: 'Show all',
        wordWrap: 'Word wrap',
        hideTabs: 'Hide tabs'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
