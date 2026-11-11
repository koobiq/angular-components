import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-with-custom-injector example. */
export interface ExampleText {
    userInfo: string;
    name: string;
    role: string;
    administrator: string;
    close: string;
    open: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        userInfo: 'Информация о пользователе',
        name: 'Имя:',
        role: 'Роль:',
        administrator: 'Администратор',
        close: 'Закрыть',
        open: 'Открыть'
    },
    default: {
        userInfo: 'User info',
        name: 'Name:',
        role: 'Role:',
        administrator: 'Administrator',
        close: 'Close',
        open: 'Open'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
