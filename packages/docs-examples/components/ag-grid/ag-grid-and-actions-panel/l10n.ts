import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-and-actions-panel example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
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
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        selected: 'Выбрано:',
        more: 'Ещё',
        responsible: 'Ответственный',
        linkToIncident: 'Ссылка на инцидент',
        remove: 'Удалить',
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
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
