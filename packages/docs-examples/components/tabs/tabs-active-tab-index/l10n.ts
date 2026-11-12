import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-active-tab-index example. */
export interface ExampleTranslation {
    files: string;
    settings: string;
    tasks: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        files: 'Файлы',
        settings: 'Настройки',
        tasks: 'Задачи'
    },
    default: {
        files: 'files',
        settings: 'settings',
        tasks: 'tasks'
    }
};
