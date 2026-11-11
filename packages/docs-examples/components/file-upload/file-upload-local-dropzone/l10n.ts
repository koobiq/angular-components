import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the file-upload-local-dropzone example. */
export interface ExampleText {
    dragOnSidepanel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        dragOnSidepanel: 'Перетащите файлы на боковую панель'
    },
    default: {
        dragOnSidepanel: 'Drag your files on sidepanel'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
