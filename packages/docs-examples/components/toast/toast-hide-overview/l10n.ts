import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the toast-hide-overview example. */
export interface ExampleText {
    cancel: string;
    agentUpdateAvailable: string;
    version20315: string;
    importFiles: string;
    refresh: string;
    importComplete: string;
    byTimer: string;
    hoverOrFocus: string;
    importProgress: string;
    passwordExpires: string;
    changePassword: string;
    onCommand: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        cancel: 'Отмена',
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        importFiles: 'Импорт файлов',
        refresh: 'Обновить',
        importComplete: 'Импорт файлов завершен',
        byTimer: 'По таймеру',
        hoverOrFocus: 'Ховер или фокус',
        importProgress: '12,1 МБ из 85 МБ — осталось 15 мин',
        passwordExpires: 'Ваш пароль истекает через 5 дней',
        changePassword: 'Сменить пароль',
        onCommand: 'По команде'
    },
    default: {
        cancel: 'Cancel',
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        importFiles: 'Importing files',
        refresh: 'Refresh',
        importComplete: 'Import complete',
        byTimer: 'By timer',
        hoverOrFocus: 'Hover or focus',
        importProgress: '12.1 MB of 85 MB — 15 min left',
        passwordExpires: 'Your password expires in 5 days',
        changePassword: 'Change password',
        onCommand: 'On command'
    }
};
