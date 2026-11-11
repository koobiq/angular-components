import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the cleaner-with-disabled example. */
export interface ExampleText {
    kept: string;
    cleared: string;
    servers: string;
    database: string;
    loadBalancer: string;
    messageQueue: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        kept: 'Сохранено',
        cleared: 'Очищено',
        servers: 'Серверы',
        database: 'База данных',
        loadBalancer: 'Балансировщик нагрузки',
        messageQueue: 'Очередь сообщений'
    },
    default: {
        kept: 'Kept',
        cleared: 'Cleared',
        servers: 'Servers',
        database: 'Database',
        loadBalancer: 'Load balancer',
        messageQueue: 'Message queue'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
