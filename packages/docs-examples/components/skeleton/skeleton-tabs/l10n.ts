import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-tabs example. */
export interface ExampleText {
    loading: string;
    tabs: { label: string; content: string }[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        tabs: [
            {
                label: 'Обзор',
                content:
                    'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.'
            },
            {
                label: 'Источники',
                content:
                    'При распределённой атаке отказа в обслуживании (атаке DDoS) входящий трафик, заваливающий жертву, исходит из множества разных источников.'
            },
            {
                label: 'Митигация',
                content: 'Простая блокировка одного источника не поможет, потому что источников много.'
            }
        ]
    },
    default: {
        loading: 'Loading',
        tabs: [
            {
                label: 'Overview',
                content:
                    'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
            },
            {
                label: 'Sources',
                content:
                    'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources.'
            },
            {
                label: 'Mitigation',
                content: 'Simply attempting to block a single source is insufficient, as there are multiple sources.'
            }
        ]
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
