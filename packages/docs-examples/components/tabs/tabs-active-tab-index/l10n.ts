import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tabs-active-tab-index example. */
export interface ExampleText {
    files: string;
    settings: string;
    tasks: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
