import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-export example. */
export interface ExampleText {
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    column: (index: number) => string;
    download: (format: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        column: (index) => `Колонка ${index}`,
        download: (format) => `Скачать ${format}`
    },
    default: {
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        column: (index) => `Column ${index}`,
        download: (format) => `Download ${format}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
