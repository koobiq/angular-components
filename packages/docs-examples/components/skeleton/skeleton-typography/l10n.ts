import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-typography example. */
export interface ExampleText {
    loading: string;
    dosTitle: string;
    threatIntel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        dosTitle: 'Атака отказа в обслуживании',
        threatIntel: 'Разведка угроз'
    },
    default: {
        loading: 'Loading',
        dosTitle: 'Denial-of-service attack',
        threatIntel: 'Threat intelligence'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
