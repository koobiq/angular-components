import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the list examples. */
export interface ExampleText {
    item7Pinned: string;
    selected: string;
    elements: string;
    items: string;
    securityControls: string;
    incidentTypes: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        item7Pinned: 'Пункт 7. Сортировка запрещена',
        selected: 'Выбрано:',
        elements: 'Элементы',
        items: 'Пункты',
        securityControls: 'Средства защиты',
        incidentTypes: 'Типы инцидентов'
    },
    default: {
        item7Pinned: 'Item 7. Sorting is prohibited',
        selected: 'Selected:',
        elements: 'Elements',
        items: 'Items',
        securityControls: 'Security controls',
        incidentTypes: 'Incident types'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
