import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dl-alignment example. */
export interface ExampleText {
    identifier: string;
    status: string;
    new: string;
    severity: string;
    tags: string;
    critical: string;
    tagPhishing: string;
    tagMalware: string;
    tagWorkstation: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        identifier: 'Идентификатор',
        status: 'Статус',
        new: 'Новый',
        severity: 'Важность',
        tags: 'Теги',
        critical: 'Критический',
        tagPhishing: 'Фишинг',
        tagMalware: 'Вредоносное ПО',
        tagWorkstation: 'Рабочая станция'
    },
    default: {
        identifier: 'Identifier',
        status: 'Status',
        new: 'New',
        severity: 'Severity',
        tags: 'Tags',
        critical: 'Critical',
        tagPhishing: 'Phishing',
        tagMalware: 'Malware',
        tagWorkstation: 'Workstation'
    }
};
