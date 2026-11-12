import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the actions-panel-adaptive example. */
export interface ExampleText {
    open: string;
    responsible: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    actionInitiated: (action: string) => string;
    status: string;
    archive: string;
    more: string;
    adaptiveFirst: string;
    adaptiveThen: string;
    adaptiveAll: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        open: 'открыть',
        responsible: 'Ответственный',
        selected: 'Выбрано:',
        actionInitiated: (action) => `Действие ${action} инициировано`,
        status: 'Статус',
        archive: 'Архив',
        more: 'Ещё',
        adaptiveFirst: 'Сначала скрывается число записей',
        adaptiveThen: 'Затем действия скрываются под меню',
        adaptiveAll: 'Всё скрыто под меню'
    },
    default: {
        open: 'open',
        responsible: 'Responsible',
        selected: 'Selected:',
        actionInitiated: (action) => `Action initiated ${action}`,
        status: 'Status',
        archive: 'Archive',
        more: 'More',
        adaptiveFirst: 'First, the number of records is hidden',
        adaptiveThen: 'Then, the actions are hidden under the dropdown menu',
        adaptiveAll: 'Everything is hidden under the dropdown menu'
    }
};
