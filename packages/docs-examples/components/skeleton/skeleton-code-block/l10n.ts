import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the skeleton examples. Domain names, product names (LDAP) and logins stay as-is. */
export interface ExampleTranslation {
    loading: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка'
    },
    default: {
        loading: 'Loading'
    }
};
