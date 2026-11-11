import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the badge-table example. */
export interface ExampleText {
    badge: string;
    column: (index: number) => string;
    value: string;
    link: string;
    phishingResource: string;
    processListAttempt: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        badge: 'Бейдж',
        column: (index) => `Столбец ${index}`,
        value: 'Значение',
        link: 'Ссылка',
        phishingResource: 'EXT. Использование фишинговых ресурсов (phishingAttacks)',
        processListAttempt:
            'Обнаружена попытка получить список процессов, запущенных в системе, на узле qa-kolobok.mpqa.rd.koobiq.com'
    },
    default: {
        badge: 'Badge',
        column: (index) => `Column ${index}`,
        value: 'Value',
        link: 'Link',
        phishingResource: 'EXT. Use of phishing resources (phishingAttacks)',
        processListAttempt:
            'An attempt to get the list of processes running on the system was detected on host qa-kolobok.mpqa.rd.koobiq.com'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
