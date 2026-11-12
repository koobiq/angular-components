import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-save-invalid-items example. */
export interface ExampleText {
    placeholder: string;
    roles: string;
    edit: string;
    discardChanges: string;
    close: string;
    couldntUpdate: string;
    invalidItemsIntro1: string;
    invalidItemsIntro2: string;
    theseRolesNotAvailable: (roles: string) => string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        roles: 'Роли',
        edit: 'Редактировать',
        discardChanges: 'Отменить изменения',
        close: 'Закрыть',
        couldntUpdate: 'Не удалось обновить поле',
        invalidItemsIntro1: 'Добавьте',
        invalidItemsIntro2: 'в роли, чтобы сервер их отклонил.',
        theseRolesNotAvailable: (roles) => `Эти роли недоступны: ${roles}`
    },
    default: {
        placeholder: 'Placeholder',
        roles: 'Roles',
        edit: 'Edit',
        discardChanges: 'Discard changes',
        close: 'Close',
        couldntUpdate: 'Couldn’t update the field',
        invalidItemsIntro1: 'Add',
        invalidItemsIntro2: 'to the roles to have the server reject them.',
        theseRolesNotAvailable: (roles) => `These roles are not available: ${roles}`
    }
};
