import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the notification-center-infinite-scroll example. */
export interface ExampleText {
    appName: string;
    assets: string;
    issues: string;
    incidents: string;
    policies: string;
    security: string;
    notifications: string;
    systemMonitor: string;
    administrator: string;
    issueStatuses: { open: string; inProgress: string; complete: string; closed: string };
    securitySections: { identity: string; membersAndGuests: string; dataRetention: string };
    pageTitle: string;
    primaryAction: string;
    emptyState: { image: string; title: string; text: string };
    pageItemTitle: (index: number) => string;
    pageItemCaption: (page: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        appName: 'Короткое название',
        assets: 'Активы',
        issues: 'Задачи',
        incidents: 'Инциденты',
        policies: 'Политики',
        security: 'Безопасность',
        notifications: 'Уведомления',
        systemMonitor: 'Мониторинг системы',
        administrator: 'Администратор',
        issueStatuses: { open: 'Открытые', inProgress: 'В работе', complete: 'Выполненные', closed: 'Закрытые' },
        securitySections: {
            identity: 'Идентификация',
            membersAndGuests: 'Участники и гости',
            dataRetention: 'Хранение данных'
        },
        pageTitle: 'Заголовок страницы',
        primaryAction: 'Основное действие',
        emptyState: { image: 'Пустое состояние', title: 'Нет объектов', text: 'Здесь пока нет добавленных объектов' },
        pageItemTitle: (index) => `Уведомление № ${index}`,
        pageItemCaption: (page) => `Загружено на странице ${page}`
    },
    default: {
        appName: 'Short App Name',
        assets: 'Assets',
        issues: 'Issues',
        incidents: 'Incidents',
        policies: 'Policies',
        security: 'Security',
        notifications: 'Notifications',
        systemMonitor: 'System Monitor',
        administrator: 'Administrator',
        issueStatuses: { open: 'Open', inProgress: 'In Progress', complete: 'Complete', closed: 'Closed' },
        securitySections: {
            identity: 'Identity',
            membersAndGuests: 'Members and guests',
            dataRetention: 'Data retention'
        },
        pageTitle: 'Page Title',
        primaryAction: 'Primary Action',
        emptyState: { image: 'Empty state', title: 'No items', text: 'No objects have been added here yet' },
        pageItemTitle: (index) => `Notification #${index}`,
        pageItemCaption: (page) => `Loaded with page ${page}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
