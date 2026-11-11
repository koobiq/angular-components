import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-overview example. */
export interface ExampleText {
    openConfirmModal: string;
    openSuccessModal: string;
    openDeleteModal: string;
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    allChangesSaved: string;
    deleteCustomer: string;
    delete: string;
    ok: string;
    deleteContent: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openConfirmModal: 'Открыть Confirm-модалку',
        openSuccessModal: 'Открыть Success-модалку',
        openDeleteModal: 'Открыть Delete-модалку',
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена',
        changesSaved: 'Изменения сохранены',
        allChangesSaved: 'Все изменения сохранены!',
        deleteCustomer: 'Удалить клиента',
        delete: 'Удалить',
        ok: 'ОК',
        deleteContent:
            'Задачи, политики и метки, связанные с заказчиком, также будут удалены. Удалить выбранного заказчика?'
    },
    default: {
        openConfirmModal: 'Open Confirm Modal',
        openSuccessModal: 'Open Success Modal',
        openDeleteModal: 'Open Delete Modal',
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel',
        changesSaved: 'Changes saved',
        allChangesSaved: 'All changes are saved!',
        deleteCustomer: 'Delete customer',
        delete: 'Delete',
        ok: 'OK',
        deleteContent:
            'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
