import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-active-tab-id example. */
export interface ExampleText {
    files: string;
    settings: string;
    tasks: string;
    contentForId: (id: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
