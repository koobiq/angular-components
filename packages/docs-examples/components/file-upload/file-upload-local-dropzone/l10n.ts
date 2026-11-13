import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-local-dropzone example. */
export interface ExampleTranslation {
    dragOnSidepanel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        dragOnSidepanel: 'Перетащите файлы на боковую панель'
    },
    default: {
        dragOnSidepanel: 'Drag your files on sidepanel'
    }
};
