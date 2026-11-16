import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-content example. */
export interface ExampleTranslation {
    createGroup: string;
    agentsGroupText: string;
    noGroups: string;
    altEmptyState: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
