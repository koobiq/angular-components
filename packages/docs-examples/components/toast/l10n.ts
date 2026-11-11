import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the toast examples. */
export interface ExampleText {
    mailServersWindows: string;
    restore: string;
    view: string;
    reject: string;
    action: (index: number) => string;
    secondaryAction: (index: number) => string;
    twoActions: string;
    manyActions: string;
    importComplete: string;
    cancel: string;
    byTimer: string;
    hoverOrFocus: string;
    info: string;
    success: string;
    warning: string;
    error: string;
    updateAvailableComponents: string;
    title: string;
    subtitleDetails: string;
    agentUpdateAvailable: string;
    version20315: string;
    importFiles: string;
    importProgress: string;
    passwordExpires: string;
    refresh: string;
    showToast: string;
    toastWithProgress: string;
    report: string;
    perimeterProtection: string;
    deleted: string;
    deleted13Records: string;
    failedToAuthorize: string;
    update: string;
    changePassword: string;
    multilineTitle: string;
    multilineCaption: string;
    multilineContent: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        mailServersWindows: 'Почтовые серверы Windows',
        restore: 'Восстановить',
        view: 'Посмотреть',
        reject: 'Отклонить',
        action: (index) => `Действие ${index}`,
        secondaryAction: (index) => `Второстепенное действие ${index}`,
        twoActions: 'Два действия',
        manyActions: 'Много действий',
        importComplete: 'Импорт файлов завершен',
        cancel: 'Отмена',
        byTimer: 'По таймеру',
        hoverOrFocus: 'Ховер или фокус',
        info: 'Информация',
        success: 'Успех',
        warning: 'Предупреждение',
        error: 'Ошибка',
        updateAvailableComponents: 'Доступно обновление компонентов',
        title: 'Заголовок',
        subtitleDetails: 'Подзаголовок, подробности',
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        importFiles: 'Импорт файлов',
        importProgress: '12,1 МБ из 85 МБ — осталось 15 мин',
        passwordExpires: 'Ваш пароль истекает через 5 дней',
        refresh: 'Обновить',
        showToast: 'Показать тост',
        toastWithProgress: 'Тост с прогресс-баром, кнопкой Отмена и без крестика',
        report: 'Отчет',
        perimeterProtection: 'Защита периметра',
        deleted: 'удален',
        deleted13Records: 'Удалено 13 записей из журнала событий',
        failedToAuthorize: 'Не удалось авторизовать 15 агентов',
        update: 'Обновить',
        changePassword: 'Сменить пароль',
        multilineTitle: 'Доступно \nобновление \nагента',
        multilineCaption: 'Версия: \n2.03.15 от 15 мая 2022',
        multilineContent:
            'Содержит: \n№1 - Очень важные изменения\n№2 - Менее важные изменения\n№3 - Совсем неважные изменения'
    },
    default: {
        mailServersWindows: 'Windows mail servers',
        restore: 'Restore',
        view: 'View',
        reject: 'Reject',
        action: (index) => `Action ${index}`,
        secondaryAction: (index) => `Secondary action ${index}`,
        twoActions: 'Two actions',
        manyActions: 'Many actions',
        importComplete: 'Import complete',
        cancel: 'Cancel',
        byTimer: 'By timer',
        hoverOrFocus: 'Hover or focus',
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        updateAvailableComponents: 'Component update available',
        title: 'Title',
        subtitleDetails: 'Subtitle, details',
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        importFiles: 'Importing files',
        importProgress: '12.1 MB of 85 MB — 15 min left',
        passwordExpires: 'Your password expires in 5 days',
        refresh: 'Refresh',
        showToast: 'Show toast',
        toastWithProgress: 'Toast with a progress bar, a Cancel button and no close icon',
        report: 'Report',
        perimeterProtection: 'Perimeter protection',
        deleted: 'deleted',
        deleted13Records: '13 records deleted from the event log',
        failedToAuthorize: 'Failed to authorize 15 agents',
        update: 'Update',
        changePassword: 'Change password',
        multilineTitle: 'Agent \nupdate \navailable',
        multilineCaption: 'Version: \n2.03.15 from May 15, 2022',
        multilineContent:
            'Includes: \n#1 - Very important changes\n#2 - Less important changes\n#3 - Not important changes at all'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
