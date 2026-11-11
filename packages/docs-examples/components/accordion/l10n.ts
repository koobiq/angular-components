import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the accordion examples. Feature-toggle labels (Icon, Caption, Badge) stay English as demo metadata. */
export interface ExampleText {
    sectionTitle: string;
    content: string;
    panel: string;
    openPanel: string;
    profile: string;
    specifications: string;
    servers: string;
    data: string;
    note: string;
    delivery: string;
    payment: string;
    refund: string;
    resetSavedState: string;
    apply: string;
    enabled: string;
    name: string;
    rename: string;
    duplicate: string;
    delete: string;
    boltSection: (section: number) => string;
    bugSection: (section: number) => string;
    moreSection: (section: number) => string;
    run: (title: string) => string;
    moreActionsFor: (title: string) => string;
    toggleSectionHint: string;
    keyboardHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sectionTitle: 'Текст',
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        panel: 'Панель',
        openPanel: 'Открыть панель с аккордеоном',
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        data: 'Данные',
        note: 'Заметка',
        delivery: 'Доставка',
        payment: 'Оплата',
        refund: 'Возврат',
        resetSavedState: 'Сбросить сохранённое состояние',
        apply: 'Применить',
        enabled: 'Включено',
        name: 'Имя',
        rename: 'Переименовать',
        duplicate: 'Дублировать',
        delete: 'Удалить',
        boltSection: (section) => `Молния, секция ${section}`,
        bugSection: (section) => `Ошибка, секция ${section}`,
        moreSection: (section) => `Ещё, секция ${section}`,
        run: (title) => `Запустить ${title}`,
        moreActionsFor: (title) => `Другие действия для ${title}`,
        toggleSectionHint: 'Скрытие и раскрытие секций производится по нажатию на всю секцию',
        keyboardHint: 'Enter и Space переключают секцию, только когда фокус на самом триггере'
    },
    default: {
        sectionTitle: 'Text',
        content: 'This text illustrates the inner content of the accordion section',
        panel: 'Panel',
        openPanel: 'Open panel with accordion',
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        data: 'Data',
        note: 'Note',
        delivery: 'Delivery',
        payment: 'Payment',
        refund: 'Refund',
        resetSavedState: 'Reset saved state',
        apply: 'Apply',
        enabled: 'Enabled',
        name: 'Name',
        rename: 'Rename',
        duplicate: 'Duplicate',
        delete: 'Delete',
        boltSection: (section) => `Bolt, section ${section}`,
        bugSection: (section) => `Bug, section ${section}`,
        moreSection: (section) => `More, section ${section}`,
        run: (title) => `Run ${title}`,
        moreActionsFor: (title) => `More actions for ${title}`,
        toggleSectionHint: 'Sections are collapsed and expanded by clicking anywhere on the section',
        keyboardHint: 'Enter and Space toggle the section only while the trigger itself is focused'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
