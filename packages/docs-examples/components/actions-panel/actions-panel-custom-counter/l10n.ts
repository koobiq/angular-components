import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the actions-panel-custom-counter example. */
export interface ExampleText {
    open: string;
    responsible: string;
    linkToIncident: string;
    remove: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    more: string;
    totalInGroups: string;
    totalInGroupsAria: (counter: number) => string;
    actionInitiated: (action: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        responsible: 'Ответственный',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        selected: 'Выбрано:',
        more: 'Ещё',
        totalInGroups: 'Общее число объектов в выбранных группах',
        totalInGroupsAria: (counter) => `Общее число объектов в выбранных группах: +${counter}`,
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        open: 'open',
        responsible: 'Responsible',
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        selected: 'Selected:',
        more: 'More',
        totalInGroups: 'Total number of items in selected groups',
        totalInGroupsAria: (counter) => `Total number of items in selected groups: +${counter}`,
        actionInitiated: (action) => `Action initiated ${action}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
