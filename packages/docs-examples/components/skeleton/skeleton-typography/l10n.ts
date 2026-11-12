import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-typography example. */
export interface ExampleTranslation {
    loading: string;
    dosTitle: string;
    threatIntel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
