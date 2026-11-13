import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the toggle examples. */
export interface ExampleTranslation {
    shakeToUndoHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        shakeToUndoHint:
            'Если вы случайно делитесь телефоном, вы можете отключить встряхивание для отмены, чтобы предотвратить появление предупреждения об отмене.'
    },
    default: {
        shakeToUndoHint:
            'If you tend to share your phone by accident, you can disable Shake to Undo to prevent the Undo alert from appearing.'
    }
};
