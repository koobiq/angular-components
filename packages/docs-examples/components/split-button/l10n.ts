import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the split-button examples. Style names (Filled Contrast) stay English as API names. */
export interface ExampleText {
    splitButton: string;
    moreOptions: string;
    add: string;
    primaryDisabled: string;
    secondaryDisabled: string;
    completelyDisabled: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        add: 'Добавить',
        primaryDisabled: 'Основная отключена',
        secondaryDisabled: 'Вторичная отключена',
        completelyDisabled: 'Полностью отключена'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        add: 'Add',
        primaryDisabled: 'Primary Disabled',
        secondaryDisabled: 'Secondary Disabled',
        completelyDisabled: 'Completely Disabled'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
