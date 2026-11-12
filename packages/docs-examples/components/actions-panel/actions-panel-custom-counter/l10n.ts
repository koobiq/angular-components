import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the actions-panel-custom-counter example. */
export interface ExampleTranslation {
    open: string;
    responsible: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    actionInitiated: (action: string) => string;
    linkToIncident: string;
    remove: string;
    more: string;
    totalInGroups: string;
    totalInGroupsAria: (counter: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        open: 'открыть',
        responsible: 'Ответственный',
        selected: 'Выбрано:',
        actionInitiated: (action) => `Действие ${action} инициировано`,
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        more: 'Ещё',
        totalInGroups: 'Общее число объектов в выбранных группах',
        totalInGroupsAria: (counter) => `Общее число объектов в выбранных группах: +${counter}`
    },
    default: {
        open: 'open',
        responsible: 'Responsible',
        selected: 'Selected:',
        actionInitiated: (action) => `Action initiated ${action}`,
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        more: 'More',
        totalInGroups: 'Total number of items in selected groups',
        totalInGroupsAria: (counter) => `Total number of items in selected groups: +${counter}`
    }
};
