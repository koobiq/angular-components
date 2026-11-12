import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the cleaner-with-disabled example. */
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

export const TEXT: LocalizedText<ExampleText> = {
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
