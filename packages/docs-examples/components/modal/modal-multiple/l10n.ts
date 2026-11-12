import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-multiple example. */
export interface ExampleTranslation {
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    allChangesSaved: string;
    openTwoModals: string;
    ok: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена',
        changesSaved: 'Изменения сохранены',
        allChangesSaved: 'Все изменения сохранены!',
        openTwoModals: 'Открыть две модалки',
        ok: 'ОК'
    },
    default: {
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel',
        changesSaved: 'Changes saved',
        allChangesSaved: 'All changes are saved!',
        openTwoModals: 'Open two modals',
        ok: 'OK'
    }
};
