import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-directive example. */
export interface ExampleText {
    loading: string;
    dosTitle: string;
    readMore: string;
    block: string;
    ignore: string;
    report: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
