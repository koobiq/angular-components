import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-group example. */
export interface ExampleTranslation {
    loading: string;
    blocked: string;
    groupLinks: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка',
        blocked: 'Заблокирован',
        groupLinks: ['Обзор', 'API', 'Примеры', 'История изменений']
    },
    default: {
        loading: 'Loading',
        blocked: 'Blocked',
        groupLinks: ['Overview', 'API', 'Examples', 'Changelog']
    }
};
