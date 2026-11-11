import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-and-actions-panel example. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    selected: string;
    more: string;
    responsible: string;
    linkToIncident: string;
    remove: string;
    actionInitiated: (action: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        selected: 'Выбрано:',
        more: 'Ещё',
        responsible: 'Ответственный',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        selected: 'Selected:',
        more: 'More',
        responsible: 'Responsible',
        linkToIncident: 'Link to incident',
        remove: 'Remove',
        actionInitiated: (action) => `Action initiated ${action}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
