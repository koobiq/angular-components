import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the file-upload-multiple-error-filled example. */
export interface ExampleText {
    noMoreThan1mb: string;
    provideValidExtension: string;
    sizeLimitExceeded: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        noMoreThan1mb: 'Не более 1 МБ',
        provideValidExtension: 'Укажите допустимое расширение',
        sizeLimitExceeded: 'Превышен лимит размера файла'
    },
    default: {
        noMoreThan1mb: 'No more than 1 MB',
        provideValidExtension: 'Provide valid extension',
        sizeLimitExceeded: 'The file size limit has been exceeded'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
