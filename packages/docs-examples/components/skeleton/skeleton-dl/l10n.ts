import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-dl example. */
export interface ExampleTranslation {
    loading: string;
    dlItems: { term: string; value: string }[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка',
        dlItems: [
            { term: 'Домен', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
            { term: 'Тип подключения', value: 'Синхронизация и аутентификация' },
            { term: 'Серверы', value: 'productname1.security.com:555, productname2.security.com:556' }
        ]
    },
    default: {
        loading: 'Loading',
        dlItems: [
            { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
            { term: 'Connection type', value: 'Synchronization and authentication' },
            { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' }
        ]
    }
};
