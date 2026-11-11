import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-multiple example. */
export interface ExampleText {
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    allChangesSaved: string;
    openTwoModals: string;
    ok: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
