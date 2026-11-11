import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-select example. */
export interface ExampleText {
    assignee: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        assignee: 'Исполнитель'
    },
    default: {
        assignee: 'Assignee'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
