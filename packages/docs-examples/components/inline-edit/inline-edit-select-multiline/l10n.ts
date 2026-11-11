import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-select-multiline example. */
export interface ExampleText {
    resolutionComment: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        resolutionComment: 'Комментарий к решению'
    },
    default: {
        resolutionComment: 'Resolution comment'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
