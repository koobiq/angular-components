import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-template example. */
export interface ExampleText {
    dosText: string;
    openModal: string;
    moreOptions: string;
    openSmallModal: string;
    openMediumModal: string;
    openLargeModal: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        dosText:
            'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.',
        openModal: 'Открыть модалку',
        moreOptions: 'Другие параметры',
        openSmallModal: 'Открыть малую модалку',
        openMediumModal: 'Открыть среднюю модалку',
        openLargeModal: 'Открыть большую модалку'
    },
    default: {
        dosText:
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.',
        openModal: 'Open Modal',
        moreOptions: 'More options',
        openSmallModal: 'Open small modal',
        openMediumModal: 'Open medium modal',
        openLargeModal: 'Open large modal'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
