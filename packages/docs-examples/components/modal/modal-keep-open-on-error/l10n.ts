import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-keep-open-on-error example. */
export interface ExampleTranslation {
    changePassword: string;
    title: string;
    currentPassword: string;
    newPassword: string;
    save: string;
    cancel: string;
    wrongPassword: string;
    demoHint: string;
    confirmTitle: string;
    confirmContent: string;
    discard: string;
    keepEditing: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        changePassword: 'Сменить пароль',
        title: 'Смена пароля',
        currentPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        save: 'Сохранить',
        cancel: 'Отмена',
        wrongPassword: 'Неверный текущий пароль',
        demoHint: 'Для демо правильный текущий пароль — «password»',
        confirmTitle: 'Несохранённые изменения',
        confirmContent: 'Закрыть без сохранения?',
        discard: 'Закрыть без сохранения',
        keepEditing: 'Продолжить редактирование'
    },
    default: {
        changePassword: 'Change password',
        title: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        save: 'Save',
        cancel: 'Cancel',
        wrongPassword: 'Incorrect current password',
        demoHint: 'For the demo, the correct current password is "password"',
        confirmTitle: 'Unsaved changes',
        confirmContent: 'Close without saving?',
        discard: 'Close without saving',
        keepEditing: 'Keep editing'
    }
};
