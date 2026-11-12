import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-with-custom-injector example. */
export interface ExampleText {
    close: string;
    open: string;
    userInfo: string;
    name: string;
    role: string;
    administrator: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        userInfo: 'Информация о пользователе',
        name: 'Имя:',
        role: 'Роль:',
        administrator: 'Администратор'
    },
    default: {
        close: 'Close',
        open: 'Open',
        userInfo: 'User info',
        name: 'Name:',
        role: 'Role:',
        administrator: 'Administrator'
    }
};
