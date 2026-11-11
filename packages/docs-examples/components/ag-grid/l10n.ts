import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the ag-grid examples. */
export interface ExampleText {
    headerText: string;
    projectName: string;
    selected: string;
    severity: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        headerText: 'Текст',
        projectName: 'Название проекта',
        selected: 'Выбрано:',
        severity: 'Важность'
    },
    default: {
        headerText: 'Text',
        projectName: 'Project name',
        selected: 'Selected:',
        severity: 'Severity'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
