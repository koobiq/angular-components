import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the splitter examples. Constraint hints (min, snap) stay English as CSS mechanics. */
export interface ExampleText {
    sidebarCollapsed: string;
    terminalCollapsed: string;
    dragLeftToCollapse: string;
    dragBottomToCollapse: string;
    panel: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sidebarCollapsed: 'Панель свёрнута',
        terminalCollapsed: 'Терминал свёрнут',
        dragLeftToCollapse: 'Перетащите влево, чтобы свернуть',
        dragBottomToCollapse: 'Перетащите вниз, чтобы свернуть',
        panel: (index) => `Панель ${index}`
    },
    default: {
        sidebarCollapsed: 'Sidebar collapsed',
        terminalCollapsed: 'Terminal collapsed',
        dragLeftToCollapse: 'Drag left to collapse',
        dragBottomToCollapse: 'Drag bottom to collapse',
        panel: (index) => `Panel ${index}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
