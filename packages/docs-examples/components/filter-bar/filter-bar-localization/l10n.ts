import { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    'filters.period': string;
    'filters.date': string;
    'filters.status': string;
    'filters.tags': string;
    'filters.tree': string;
    'filters.multiTree': string;
    'filters.active': string;
    'filters.blocked': string;
    'filters.alpha': string;
    'filters.beta': string;
    'filters.platform': string;
    'filters.web': string;
    'filters.mobile': string;
    'filters.last24h': string;
    'filters.last7days': string;
    'filters.last30days': string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        'filters.period': 'Период',
        'filters.date': 'Дата',
        'filters.status': 'Статус',
        'filters.tags': 'Теги',
        'filters.tree': 'Платформа',
        'filters.multiTree': 'Платформы',
        'filters.active': 'Активен',
        'filters.blocked': 'Заблокирован',
        'filters.alpha': 'Альфа',
        'filters.beta': 'Бета',
        'filters.platform': 'Платформа',
        'filters.web': 'Веб',
        'filters.mobile': 'Мобильные',
        'filters.last24h': 'Последние 24 часа',
        'filters.last7days': 'Последние 7 дней',
        'filters.last30days': 'Последние 30 дней'
    },
    default: {
        'filters.period': 'Period',
        'filters.date': 'Date',
        'filters.status': 'Status',
        'filters.tags': 'Tags',
        'filters.tree': 'Platform',
        'filters.multiTree': 'Platforms',
        'filters.active': 'Active',
        'filters.blocked': 'Blocked',
        'filters.alpha': 'Alpha',
        'filters.beta': 'Beta',
        'filters.platform': 'Platform',
        'filters.web': 'Web',
        'filters.mobile': 'Mobile',
        'filters.last24h': 'Last 24 hours',
        'filters.last7days': 'Last 7 days',
        'filters.last30days': 'Last 30 days'
    }
};
