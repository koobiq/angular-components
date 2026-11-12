import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-with-custom-injector example. */
export interface ExampleTranslation {
    close: string;
    open: string;
    userInfo: string;
    name: string;
    role: string;
    administrator: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
