import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the file-upload-single-async-validation example. */
export interface ExampleText {
    failedToRead: string;
    onlyTxtWithLines: (maxLines: number) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        failedToRead: 'Не удалось прочитать содержимое файла',
        onlyTxtWithLines: (maxLines) => `Разрешены только TXT-файлы до ${maxLines} строк`
    },
    default: {
        failedToRead: 'Failed to read file content',
        onlyTxtWithLines: (maxLines) => `Only TXT files with up to ${maxLines} lines are allowed`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
