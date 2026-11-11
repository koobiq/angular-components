import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the actions panel examples. */
export interface ExampleText {
    open: string;
    action1: string;
    action2: string;
    action3: string;
    responsible: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    actionInitiated: (action: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        action1: 'Действие 1',
        action2: 'Действие 2',
        action3: 'Действие 3',
        responsible: 'Ответственный',
        selected: 'Выбрано:',
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        open: 'open',
        action1: 'Action 1',
        action2: 'Action 2',
        action3: 'Action 3',
        responsible: 'Responsible',
        selected: 'Selected:',
        actionInitiated: (action) => `Action initiated ${action}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
