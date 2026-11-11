import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the list examples. */
export interface ExampleText {
    item: (index: number) => string;
    item7Pinned: string;
    selected: string;
    elements: string;
    items: string;
    securityControls: string;
    incidentTypes: string;
    longElementName: string;
    badge: string;
    dropdownItem: (index: number) => string;
    groupHeader: string;
    optionN: (index: number) => string;
    assignUsers: string;
    user: string;
    nothingFound: string;
    apply: string;
    cancel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        item: (index) => `Пункт ${index}`,
        item7Pinned: 'Пункт 7. Сортировка запрещена',
        selected: 'Выбрано:',
        elements: 'Элементы',
        items: 'Пункты',
        securityControls: 'Средства защиты',
        incidentTypes: 'Типы инцидентов',
        longElementName: 'Элемент с очень очень очень очень очень очень длинным именем',
        badge: 'бейдж',
        dropdownItem: (index) => `пункт ${index}`,
        groupHeader: 'Заголовок группы',
        optionN: (index) => `Вариант №${index}`,
        assignUsers: 'Назначить пользователей',
        user: 'Пользователь',
        nothingFound: 'Ничего не найдено',
        apply: 'Применить',
        cancel: 'Отмена'
    },
    default: {
        item: (index) => `Item ${index}`,
        item7Pinned: 'Item 7. Sorting is prohibited',
        selected: 'Selected:',
        elements: 'Elements',
        items: 'Items',
        securityControls: 'Security controls',
        incidentTypes: 'Incident types',
        longElementName: 'Element with a very very very very very very long name',
        badge: 'badge',
        dropdownItem: (index) => `item ${index}`,
        groupHeader: 'Group header',
        optionN: (index) => `Option #${index}`,
        assignUsers: 'Assign users',
        user: 'User',
        nothingFound: 'Nothing found',
        apply: 'Apply',
        cancel: 'Cancel'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
