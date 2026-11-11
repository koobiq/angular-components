import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-form-field example. */
export interface ExampleText {
    loading: string;
    serverAddress: string;
    domainHint: string;
    port: string;
    ldapsPortHint: string;
    description: string;
    directoryDescription: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
