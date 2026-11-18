import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the empty-state examples. Size toggle labels (Compact, Normal, Big) stay English as API values. */
export interface ExampleTranslation {
    agentsGroupText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        agentsGroupText: 'Агенты можно объединить в группу и назначить им одни и те же политики'
    },
    default: {
        agentsGroupText: 'Agents can be grouped together and assigned the same policies.'
    }
};
