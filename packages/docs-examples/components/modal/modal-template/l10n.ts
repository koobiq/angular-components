import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the modal-template example. */
export interface ExampleText {
    openModal: string;
    dosText: string;
    moreOptions: string;
    openSmallModal: string;
    openMediumModal: string;
    openLargeModal: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        openModal: 'Открыть модалку',
        dosText:
            'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.',
        moreOptions: 'Другие параметры',
        openSmallModal: 'Открыть малую модалку',
        openMediumModal: 'Открыть среднюю модалку',
        openLargeModal: 'Открыть большую модалку'
    },
    default: {
        openModal: 'Open Modal',
        dosText:
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.',
        moreOptions: 'More options',
        openSmallModal: 'Open small modal',
        openMediumModal: 'Open medium modal',
        openLargeModal: 'Open large modal'
    }
};
