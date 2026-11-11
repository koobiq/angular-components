import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the ag-grid-copy-selected example. */
export interface ExampleText {
    headerText: string;
    text: (index: number) => string;
    projectName: string;
    projectNameN: (index: number) => string;
    dataCopied: string;
    dataCopiedCaption: (format: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        text: (index) => `Текст ${index}`,
        projectName: 'Название проекта',
        projectNameN: (index) => `Название проекта ${index}`,
        dataCopied: 'Данные скопированы',
        dataCopiedCaption: (format) => `Выбранные строки скопированы в буфер обмена. Формат: ${format}`
    },
    default: {
        headerText: 'Text',
        text: (index) => `Text ${index}`,
        projectName: 'Project name',
        projectNameN: (index) => `Project name ${index}`,
        dataCopied: 'Data copied',
        dataCopiedCaption: (format) => `Selected nodes have been copied to clipboard. Format: ${format}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
