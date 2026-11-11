import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the skeleton examples. Domain names, product names (LDAP) and logins stay as-is. */
export interface ExampleText {
    loading: string;
    syncHint: string;
    notifyHint: string;
    dosTitle: string;
    readMore: string;
    block: string;
    ignore: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        syncHint: 'Следующая синхронизация начнётся в 12:00',
        notifyHint: 'По почте и в центре уведомлений',
        dosTitle: 'Атака отказа в обслуживании',
        readMore: 'Читать далее',
        block: 'Заблокировать',
        ignore: 'Игнорировать'
    },
    default: {
        loading: 'Loading',
        syncHint: 'The next synchronization starts at 12:00',
        notifyHint: 'By email and in the notification center',
        dosTitle: 'Denial-of-service attack',
        readMore: 'Read more',
        block: 'Block',
        ignore: 'Ignore'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
