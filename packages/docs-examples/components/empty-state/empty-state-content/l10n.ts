import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the empty-state-content example. */
export interface ExampleText {
    createGroup: string;
    agentsGroupText: string;
    noGroups: string;
    altEmptyState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        createGroup: 'Создать группу',
        agentsGroupText: 'Агенты можно объединить в группу и назначить им одни и те же политики',
        noGroups: 'Нет групп',
        altEmptyState: 'Пустое состояние'
    },
    default: {
        createGroup: 'Create group',
        agentsGroupText: 'Agents can be grouped together and assigned the same policies.',
        noGroups: 'No Groups',
        altEmptyState: 'Empty state'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
