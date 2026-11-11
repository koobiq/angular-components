import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the actions-panel-adaptive example. */
export interface ExampleText {
    open: string;
    responsible: string;
    status: string;
    archive: string;
    /** Prefix of the selected records counter; the count follows after a space. */
    selected: string;
    more: string;
    actionInitiated: (action: string) => string;
    adaptiveFirst: string;
    adaptiveThen: string;
    adaptiveAll: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        responsible: 'Ответственный',
        status: 'Статус',
        archive: 'Архив',
        selected: 'Выбрано:',
        more: 'Ещё',
        actionInitiated: (action) => `Действие ${action} инициировано`,
        adaptiveFirst: 'Сначала скрывается число записей',
        adaptiveThen: 'Затем действия скрываются под меню',
        adaptiveAll: 'Всё скрыто под меню'
    },
    default: {
        open: 'open',
        responsible: 'Responsible',
        status: 'Status',
        archive: 'Archive',
        selected: 'Selected:',
        more: 'More',
        actionInitiated: (action) => `Action initiated ${action}`,
        adaptiveFirst: 'First, the number of records is hidden',
        adaptiveThen: 'Then, the actions are hidden under the dropdown menu',
        adaptiveAll: 'Everything is hidden under the dropdown menu'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
