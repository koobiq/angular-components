import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the badge-table example. */
export interface ExampleText {
    badge: string;
    value: string;
    link: string;
    phishingResource: string;
    processListAttempt: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        badge: 'Бейдж',
        value: 'Значение',
        link: 'Ссылка',
        phishingResource: 'EXT. Использование фишинговых ресурсов (phishingAttacks)',
        processListAttempt:
            'Обнаружена попытка получить список процессов, запущенных в системе, на узле qa-kolobok.mpqa.rd.koobiq.com'
    },
    default: {
        badge: 'Badge',
        value: 'Value',
        link: 'Link',
        phishingResource: 'EXT. Use of phishing resources (phishingAttacks)',
        processListAttempt:
            'An attempt to get the list of processes running on the system was detected on host qa-kolobok.mpqa.rd.koobiq.com'
    }
};
