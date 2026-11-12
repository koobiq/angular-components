import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-typography example. */
export interface ExampleText {
    loading: string;
    dosTitle: string;
    threatIntel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
