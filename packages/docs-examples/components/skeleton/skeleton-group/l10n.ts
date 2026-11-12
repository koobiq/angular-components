import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-group example. */
export interface ExampleText {
    loading: string;
    blocked: string;
    groupLinks: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
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
