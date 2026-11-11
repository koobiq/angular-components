import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the tree-select examples. File names and host names stay as-is. */
export interface ExampleText {
    nothingFound: string;
    deletedItems: (count: number) => string;
    allNodes: string;
    placeholder: string;
    kept: string;
    cleared: string;
    servers: string;
    database: string;
    loadBalancer: string;
    messageQueue: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        nothingFound: 'Ничего не найдено',
        deletedItems: (count) => `Удалено элементов: ${count} — удалите их из выбора`,
        allNodes: 'Все узлы',
        placeholder: 'Плейсхолдер',
        kept: 'Сохранено',
        cleared: 'Очищено',
        servers: 'Серверы',
        database: 'База данных',
        loadBalancer: 'Балансировщик нагрузки',
        messageQueue: 'Очередь сообщений'
    },
    default: {
        nothingFound: 'Nothing found',
        deletedItems: (count) => `Deleted items: ${count} — remove them from the selection`,
        allNodes: 'All nodes',
        placeholder: 'Placeholder',
        kept: 'Kept',
        cleared: 'Cleared',
        servers: 'Servers',
        database: 'Database',
        loadBalancer: 'Load balancer',
        messageQueue: 'Message queue'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
