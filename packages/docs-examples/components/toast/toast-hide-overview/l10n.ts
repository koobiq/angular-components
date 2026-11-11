import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-hide-overview example. */
export interface ExampleText {
    importComplete: string;
    cancel: string;
    byTimer: string;
    hoverOrFocus: string;
    agentUpdateAvailable: string;
    version20315: string;
    importFiles: string;
    importProgress: string;
    passwordExpires: string;
    refresh: string;
    changePassword: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        importComplete: 'Импорт файлов завершен',
        cancel: 'Отмена',
        byTimer: 'По таймеру',
        hoverOrFocus: 'Ховер или фокус',
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        importFiles: 'Импорт файлов',
        importProgress: '12,1 МБ из 85 МБ — осталось 15 мин',
        passwordExpires: 'Ваш пароль истекает через 5 дней',
        refresh: 'Обновить',
        changePassword: 'Сменить пароль'
    },
    default: {
        importComplete: 'Import complete',
        cancel: 'Cancel',
        byTimer: 'By timer',
        hoverOrFocus: 'Hover or focus',
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        importFiles: 'Importing files',
        importProgress: '12.1 MB of 85 MB — 15 min left',
        passwordExpires: 'Your password expires in 5 days',
        refresh: 'Refresh',
        changePassword: 'Change password'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
