import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tabs-active-tab-index example. */
export interface ExampleText {
    files: string;
    settings: string;
    tasks: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
