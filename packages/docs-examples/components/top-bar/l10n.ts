import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the top-bar examples. */
export interface ExampleText {
    actions: string;
    details: string;
    filter: string;
    share: string;
    page: string;
    description: string;
    status: string;
    additionalInformation: string;
    badge: string;
    pageHeader: string;
    dashboards: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        actions: 'Действия',
        details: 'Детали',
        filter: 'Фильтр',
        share: 'Поделиться',
        page: 'Страница',
        description: 'Описание',
        status: 'Статус',
        additionalInformation: 'Дополнительная информация',
        badge: 'Бейдж',
        pageHeader: 'Заголовок страницы',
        dashboards: 'Дашборды'
    },
    default: {
        actions: 'Actions',
        details: 'Details',
        filter: 'Filter',
        share: 'Share',
        page: 'Page',
        description: 'Description',
        status: 'Status',
        additionalInformation: 'Additional Information',
        badge: 'Badge',
        pageHeader: 'Page Header',
        dashboards: 'Dashboards'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
