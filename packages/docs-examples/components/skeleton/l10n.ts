import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the skeleton examples. Domain names, product names (LDAP) and logins stay as-is. */
export interface ExampleText {
    loading: string;
    syncHint: string;
    notifyHint: string;
    dosTitle: string;
    readMore: string;
    block: string;
    ignore: string;
    report: string;
    start: string;
    active: string;
    history: string;
    serverAddress: string;
    domainHint: string;
    port: string;
    ldapsPortHint: string;
    description: string;
    directoryDescription: string;
    accordionSections: { title: string; content: string }[];
    dlItems: { term: string; value: string }[];
    tabs: { label: string; content: string }[];
    threatIntel: string;
    blocked: string;
    groupLinks: string[];
    treeGroups: string[];
    openSidepanel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        syncHint: 'Следующая синхронизация начнётся в 12:00',
        notifyHint: 'По почте и в центре уведомлений',
        dosTitle: 'Атака отказа в обслуживании',
        readMore: 'Читать далее',
        block: 'Заблокировать',
        ignore: 'Игнорировать',
        report: 'Сообщить',
        start: 'Запустить',
        active: 'Активен',
        history: 'История',
        serverAddress: 'Адрес сервера',
        domainHint: 'Доменное имя или IP-адрес',
        port: 'Порт',
        ldapsPortHint: 'LDAPS слушает порт 636',
        description: 'Описание',
        directoryDescription: 'Основной сервер каталога домена security.com',
        accordionSections: [
            { title: 'Подключение', content: 'Адрес сервера, порт и тип подключения.' },
            { title: 'Синхронизация', content: 'Как часто обновляются пользователи и группы каталога.' },
            { title: 'Аутентификация', content: 'Кто может войти с учётной записью каталога.' }
        ],
        dlItems: [
            { term: 'Домен', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
            { term: 'Тип подключения', value: 'Синхронизация и аутентификация' },
            { term: 'Серверы', value: 'productname1.security.com:555, productname2.security.com:556' }
        ],
        tabs: [
            {
                label: 'Обзор',
                content:
                    'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.'
            },
            {
                label: 'Источники',
                content:
                    'При распределённой атаке отказа в обслуживании (атаке DDoS) входящий трафик, заваливающий жертву, исходит из множества разных источников.'
            },
            {
                label: 'Митигация',
                content: 'Простая блокировка одного источника не поможет, потому что источников много.'
            }
        ],
        threatIntel: 'Разведка угроз',
        blocked: 'Заблокирован',
        groupLinks: ['Обзор', 'API', 'Примеры', 'История изменений'],
        treeGroups: ['Операторы', 'Администраторы', 'Разработчики', 'Тестировщики', 'Гости'],
        openSidepanel: 'Открыть панель'
    },
    default: {
        loading: 'Loading',
        syncHint: 'The next synchronization starts at 12:00',
        notifyHint: 'By email and in the notification center',
        dosTitle: 'Denial-of-service attack',
        readMore: 'Read more',
        block: 'Block',
        ignore: 'Ignore',
        report: 'Report',
        start: 'Start',
        active: 'Active',
        history: 'History',
        serverAddress: 'Server address',
        domainHint: 'Domain name or IP address',
        port: 'Port',
        ldapsPortHint: 'LDAPS listens on port 636',
        description: 'Description',
        directoryDescription: 'Primary directory server of the security.com domain',
        accordionSections: [
            { title: 'Connection', content: 'The server address, the port and the type of the connection.' },
            { title: 'Synchronization', content: 'How often the users and the groups of the directory are updated.' },
            { title: 'Authentication', content: 'Who is allowed to sign in with an account of the directory.' }
        ],
        dlItems: [
            { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
            { term: 'Connection type', value: 'Synchronization and authentication' },
            { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' }
        ],
        tabs: [
            {
                label: 'Overview',
                content:
                    'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
            },
            {
                label: 'Sources',
                content:
                    'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources.'
            },
            {
                label: 'Mitigation',
                content: 'Simply attempting to block a single source is insufficient, as there are multiple sources.'
            }
        ],
        threatIntel: 'Threat intelligence',
        blocked: 'Blocked',
        groupLinks: ['Overview', 'API', 'Examples', 'Changelog'],
        treeGroups: ['Operators', 'Administrators', 'Developers', 'Testers', 'Guests'],
        openSidepanel: 'Open sidepanel'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
