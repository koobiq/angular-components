import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the file-upload-single-accept-validation example. */
export interface ExampleText {
    fileTxtAllowed: string;
    provideValidExtension: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fileTxtAllowed: 'Разрешён файл с расширением TXT',
        provideValidExtension: 'Укажите допустимое расширение'
    },
    default: {
        fileTxtAllowed: 'File with TXT extension is allowed',
        provideValidExtension: 'Provide valid extension'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
