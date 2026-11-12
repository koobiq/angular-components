import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-form-field example. */
export interface ExampleTranslation {
    loading: string;
    serverAddress: string;
    domainHint: string;
    port: string;
    ldapsPortHint: string;
    description: string;
    directoryDescription: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка',
        serverAddress: 'Адрес сервера',
        domainHint: 'Доменное имя или IP-адрес',
        port: 'Порт',
        ldapsPortHint: 'LDAPS слушает порт 636',
        description: 'Описание',
        directoryDescription: 'Основной сервер каталога домена security.com'
    },
    default: {
        loading: 'Loading',
        serverAddress: 'Server address',
        domainHint: 'Domain name or IP address',
        port: 'Port',
        ldapsPortHint: 'LDAPS listens on port 636',
        description: 'Description',
        directoryDescription: 'Primary directory server of the security.com domain'
    }
};
