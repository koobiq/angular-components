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
    extraAction: (index: number) => string;
    primaryDisabled: string;
    secondaryDisabled: string;
    completelyDisabled: string;
    primaryProgress: string;
    secondaryProgress: string;
    completelyProgress: string;
    saveEngineering: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        add: 'Добавить',
        extraAction: (index) => `Дополнительное действие ${index}`,
        primaryDisabled: 'Основная отключена',
        secondaryDisabled: 'Вторичная отключена',
        completelyDisabled: 'Полностью отключена',
        primaryProgress: 'Основная в процессе',
        secondaryProgress: 'Вторичная в процессе',
        completelyProgress: 'Полностью в процессе',
        saveEngineering:
            'Экономьте время инженеров с единой платёжной функциональностью. Мы берём на себя лабиринт шлюзов, платёжных каналов и финансовых институтов, составляющих мировой экономический ландшафт, чтобы ваши команды могли создавать нужное на одной платформе.'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        add: 'Add',
        extraAction: (index) => `Extra Action ${index}`,
        primaryDisabled: 'Primary Disabled',
        secondaryDisabled: 'Secondary Disabled',
        completelyDisabled: 'Completely Disabled',
        primaryProgress: 'Primary in Progress',
        secondaryProgress: 'Secondary in Progress',
        completelyProgress: 'Completely in Progress',
        saveEngineering:
            'Save engineering time with unified payments functionality. We obsess over the maze of gateways, payments rails, and financial institutions that make up the global economic landscape so that your teams can build what you need on one platform.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
