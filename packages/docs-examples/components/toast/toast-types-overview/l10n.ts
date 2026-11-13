import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the toast-types-overview example. */
export interface ExampleTranslation {
    agentUpdateAvailable: string;
    version20315: string;
    refresh: string;
    info: string;
    success: string;
    warning: string;
    error: string;
    passwordExpires: string;
    deleted13Records: string;
    failedToAuthorize: string;
    changePassword: string;
    retry: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        refresh: 'Обновить',
        info: 'Информация',
        success: 'Успех',
        warning: 'Предупреждение',
        error: 'Ошибка',
        passwordExpires: 'Ваш пароль истекает через 5 дней',
        deleted13Records: 'Удалено 13 записей из журнала событий',
        failedToAuthorize: 'Не удалось авторизовать 15 агентов',
        changePassword: 'Сменить пароль',
        retry: 'Повторить'
    },
    default: {
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        refresh: 'Refresh',
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        passwordExpires: 'Your password expires in 5 days',
        deleted13Records: '13 records deleted from the event log',
        failedToAuthorize: 'Failed to authorize 15 agents',
        changePassword: 'Change password',
        retry: 'Retry'
    }
};
