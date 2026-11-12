import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-active-tab-id example. */
export interface ExampleTranslation {
    files: string;
    settings: string;
    tasks: string;
    contentForId: (id: string) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        files: 'Файлы',
        settings: 'Настройки',
        tasks: 'Задачи',
        contentForId: (id) => `Содержимое выбранной вкладки с id: ${id}`
    },
    default: {
        files: 'files',
        settings: 'settings',
        tasks: 'tasks',
        contentForId: (id) => `Content for selected tab with id: ${id}`
    }
};
