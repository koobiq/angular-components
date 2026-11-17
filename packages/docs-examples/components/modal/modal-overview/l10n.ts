import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-overview example. */
export interface ExampleTranslation {
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    openConfirmModal: string;
    openSuccessModal: string;
    openDeleteModal: string;
    allChangesSaved: string;
    deleteCustomer: string;
    delete: string;
    ok: string;
    deleteContent: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена',
        changesSaved: 'Изменения сохранены',
        openConfirmModal: 'Открыть Confirm-модалку',
        openSuccessModal: 'Открыть Success-модалку',
        openDeleteModal: 'Открыть Delete-модалку',
        allChangesSaved: 'Все изменения сохранены!',
        deleteCustomer: 'Удалить клиента',
        delete: 'Удалить',
        ok: 'ОК',
        deleteContent:
            'Задачи, политики и метки, связанные с заказчиком, также будут удалены. Удалить выбранного заказчика?'
    },
    default: {
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel',
        changesSaved: 'Changes saved',
        openConfirmModal: 'Open Confirm Modal',
        openSuccessModal: 'Open Success Modal',
        openDeleteModal: 'Open Delete Modal',
        allChangesSaved: 'All changes are saved!',
        deleteCustomer: 'Delete customer',
        delete: 'Delete',
        ok: 'OK',
        deleteContent:
            'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?'
    }
};
