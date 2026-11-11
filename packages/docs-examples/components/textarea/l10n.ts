import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the textarea examples. */
export interface ExampleText {
    disabled: string;
    readonly: string;
    label: string;
    placeholder: string;
    hint10: string;
    min10: string;
    dosText: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        disabled: 'Отключено',
        readonly: 'Только для чтения',
        label: 'Метка',
        placeholder: 'Плейсхолдер',
        hint10: 'Введите не менее 10 символов',
        min10: 'Минимум 10 символов',
        dosText:
            'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети. Отказ в обслуживании обычно достигается флудом целевой машины или ресурса избыточными запросами, чтобы перегрузить системы и не дать выполниться части или всем легитимным запросам. Спектр атак широк — от завала сервера миллионами запросов для замедления его работы до переполнения сервера большим объёмом некорректных данных или отправки запросов с недействительного IP-адреса.'
    },
    default: {
        disabled: 'Disabled',
        readonly: 'Readonly',
        label: 'Label',
        placeholder: 'Placeholder',
        hint10: 'Please enter at least 10 characters',
        min10: 'Minimum 10 characters',
        dosText:
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
