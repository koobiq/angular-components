import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-export example. */
export interface ExampleText {
    projectName: string;
    download: (format: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        projectName: 'Название проекта',
        download: (format) => `Скачать ${format}`
    },
    default: {
        projectName: 'Project name',
        download: (format) => `Download ${format}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
