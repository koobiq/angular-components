import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the file-upload-single-validation-reactive-forms-overview example. */
export interface ExampleText {
    sizeNotExceed5mb: string;
    sizeMustNotExceed: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ',
        sizeMustNotExceed: 'Размер файла не должен превышать лимит'
    },
    default: {
        sizeNotExceed5mb: 'The file size should not exceed 5 MB',
        sizeMustNotExceed: 'The file size must not exceed the limit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
