import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-local-dropzone example. */
export interface ExampleText {
    dragOnSidepanel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        dragOnSidepanel: 'Перетащите файлы на боковую панель'
    },
    default: {
        dragOnSidepanel: 'Drag your files on sidepanel'
    }
};
