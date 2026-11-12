import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-directive example. */
export interface ExampleText {
    loading: string;
    dosTitle: string;
    readMore: string;
    block: string;
    ignore: string;
    report: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка',
        dosTitle: 'Атака отказа в обслуживании',
        readMore: 'Читать далее',
        block: 'Заблокировать',
        ignore: 'Игнорировать',
        report: 'Сообщить'
    },
    default: {
        loading: 'Loading',
        dosTitle: 'Denial-of-service attack',
        readMore: 'Read more',
        block: 'Block',
        ignore: 'Ignore',
        report: 'Report'
    }
};
