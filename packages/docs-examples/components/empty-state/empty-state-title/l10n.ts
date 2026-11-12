import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the empty-state examples. Size toggle labels (Compact, Normal, Big) stay English as API values. */
export interface ExampleText {
    agentsGroupText: string;
    noGroups: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        agentsGroupText: 'Агенты можно объединить в группу и назначить им одни и те же политики',
        noGroups: 'Нет групп'
    },
    default: {
        agentsGroupText: 'Agents can be grouped together and assigned the same policies.',
        noGroups: 'No Groups'
    }
};
