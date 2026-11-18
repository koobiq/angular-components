import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the modal examples. */
export interface ExampleTranslation {
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена'
    },
    default: {
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel'
    }
};
