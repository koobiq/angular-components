import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the actions panel examples. */
export interface ExampleText {
    open: string;
    action1: string;
    action2: string;
    action3: string;
    executeAndClose: string;
    responsible: string;
    status: string;
    archive: string;
    linkToIncident: string;
    remove: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    more: string;
    totalInGroups: string;
    totalInGroupsAria: (counter: number) => string;
    actionInitiated: (action: string) => string;
    protection: string;
    enable: string;
    disable: string;
    enableProtectionTitle: string;
    disableProtectionTitle: string;
    save: string;
    cancel: string;
    adaptiveFirst: string;
    adaptiveThen: string;
    adaptiveAll: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        action1: 'Действие 1',
        action2: 'Действие 2',
        action3: 'Действие 3',
        executeAndClose: 'Выполнить и закрыть',
        responsible: 'Ответственный',
        status: 'Статус',
        archive: 'Архив',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        selected: 'Выбрано:',
        more: 'Ещё',
        totalInGroups: 'Общее число объектов в выбранных группах',
        totalInGroupsAria: (counter) => `Общее число объектов в выбранных группах: +${counter}`,
        actionInitiated: (action) => `Действие ${action} инициировано`,
        protection: 'Защита',
        enable: 'Включить',
        disable: 'Выключить',
        enableProtectionTitle: 'Включить защиту?',
        disableProtectionTitle: 'Выключить защиту?',
        save: 'Сохранить',
        cancel: 'Отмена',
        adaptiveFirst: 'Сначала скрывается число записей',
        adaptiveThen: 'Затем действия скрываются под меню',
        adaptiveAll: 'Всё скрыто под меню'
    },
    default: {
        open: 'open',
        action1: 'Action 1',
        action2: 'Action 2',
        action3: 'Action 3',
        executeAndClose: 'Execute and close',
        responsible: 'Responsible',
        status: 'Status',
        archive: 'Archive',
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        selected: 'Selected:',
        more: 'More',
        totalInGroups: 'Total number of items in selected groups',
        totalInGroupsAria: (counter) => `Total number of items in selected groups: +${counter}`,
        actionInitiated: (action) => `Action initiated ${action}`,
        protection: 'Protection',
        enable: 'Enable',
        disable: 'Disable',
        enableProtectionTitle: 'Enable protection?',
        disableProtectionTitle: 'Disable protection?',
        save: 'Save',
        cancel: 'Cancel',
        adaptiveFirst: 'First, the number of records is hidden',
        adaptiveThen: 'Then, the actions are hidden under the dropdown menu',
        adaptiveAll: 'Everything is hidden under the dropdown menu'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
