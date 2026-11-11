import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-types-overview example. */
export interface ExampleText {
    info: string;
    success: string;
    warning: string;
    error: string;
    agentUpdateAvailable: string;
    version20315: string;
    passwordExpires: string;
    refresh: string;
    deleted13Records: string;
    failedToAuthorize: string;
    changePassword: string;
    retry: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        info: 'Информация',
        success: 'Успех',
        warning: 'Предупреждение',
        error: 'Ошибка',
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        passwordExpires: 'Ваш пароль истекает через 5 дней',
        refresh: 'Обновить',
        deleted13Records: 'Удалено 13 записей из журнала событий',
        failedToAuthorize: 'Не удалось авторизовать 15 агентов',
        changePassword: 'Сменить пароль',
        retry: 'Повторить'
    },
    default: {
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        passwordExpires: 'Your password expires in 5 days',
        refresh: 'Refresh',
        deleted13Records: '13 records deleted from the event log',
        failedToAuthorize: 'Failed to authorize 15 agents',
        changePassword: 'Change password',
        retry: 'Retry'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
