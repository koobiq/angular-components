import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the long-cell-content example. */
export interface ExampleTranslation {
    eventHeader: string;
    hostsHeader: string;
    techniquesHeader: string;
    statusHeader: string;
    collapseLink: string;
    moreCount: (count: number) => string;
    allCount: (count: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        eventHeader: 'Событие',
        hostsHeader: 'Узлы',
        techniquesHeader: 'Техники',
        statusHeader: 'Статус',
        collapseLink: 'Свернуть',
        moreCount: (count) => `${count} еще`,
        allCount: (count) => `Все ${count}`
    },
    default: {
        eventHeader: 'Event',
        hostsHeader: 'Hosts',
        techniquesHeader: 'Techniques',
        statusHeader: 'Status',
        collapseLink: 'Collapse',
        moreCount: (count) => `${count} more`,
        allCount: (count) => `All ${count}`
    }
};
