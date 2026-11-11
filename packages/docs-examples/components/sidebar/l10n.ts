import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the sidebar examples. */
export interface ExampleText {
    leftOpenedContent: string;
    leftClosedContent: string;
    rightOpenedContent: string;
    openedContent: string;
    closedContent: string;
    mainContent: string;
    toggle: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        leftOpenedContent: 'Содержимое левой панели (открыта)',
        leftClosedContent: 'Содержимое левой панели (закрыта)',
        rightOpenedContent: 'Содержимое правой панели (открыта)',
        openedContent: 'Содержимое (открыто)',
        closedContent: 'Содержимое (закрыто)',
        mainContent: 'Основное содержимое',
        toggle: 'Переключить'
    },
    default: {
        leftOpenedContent: 'Left opened content',
        leftClosedContent: 'Left closed content',
        rightOpenedContent: 'Right opened content',
        openedContent: 'Opened content',
        closedContent: 'Closed content',
        mainContent: 'Main content',
        toggle: 'Toggle'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
