import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the content panel examples. */
export interface ExampleText {
    toggle: string;
    open: string;
    close: string;
    title: string;
    copyLink: string;
    expand: string;
    button: (index: number) => string;
    resetSavedState: string;
    stateSavingHint: string;
    dosText: (index: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        toggle: 'Переключить',
        open: 'Открыть',
        close: 'Закрыть',
        title: 'Заголовок',
        copyLink: 'Копировать ссылку',
        expand: 'Развернуть',
        button: (index) => `Кнопка ${index}`,
        resetSavedState: 'Сбросить сохранённое состояние',
        stateSavingHint:
            'Откройте панель и перетащите её левый край, затем перезагрузите страницу — панель вернётся открытой и с той шириной, на которой её оставили. Двойной щелчок по краю восстанавливает заявленную ширину, и это тоже запоминается.',
        dosText: (index) =>
            `В информатике [${index}] атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети. Отказ в обслуживании обычно достигается флудом целевой машины или ресурса избыточными запросами, чтобы перегрузить системы и не дать выполниться части или всем легитимным запросам. Спектр атак широк — от завала сервера миллионами запросов для замедления его работы до переполнения сервера большим объёмом некорректных данных или отправки запросов с недействительного IP-адреса.`
    },
    default: {
        toggle: 'Toggle',
        open: 'Open',
        close: 'Close',
        title: 'Title',
        copyLink: 'Copy link',
        expand: 'Expand',
        button: (index) => `Button ${index}`,
        resetSavedState: 'Reset saved state',
        stateSavingHint:
            'Open the panel and drag its left edge, then reload the page — the panel comes back open and at the width it was left. Double-clicking the edge restores the declared width, and that is remembered too.',
        dosText: (index) =>
            `In computing [${index}], a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
