import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the sidepanel examples. Position and size names (Right, Small) stay English as API values. */
export interface ExampleText {
    sidepanel: string;
    stateSaving: string;
    userInfo: string;
    name: string;
    role: string;
    administrator: string;
    header: string;
    close: string;
    open: string;
    disableClose: string;
    openAnother: string;
    position: string;
    closeSidepanel: string;
    openSidepanel: string;
    templateContent: string;
    templateBody: string;
    button: string;
    action: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sidepanel: 'Панель',
        stateSaving: 'Сохранение состояния панели',
        userInfo: 'Информация о пользователе',
        name: 'Имя:',
        role: 'Роль:',
        administrator: 'Администратор',
        header: 'Заголовок',
        close: 'Закрыть',
        open: 'Открыть',
        disableClose: 'Отключить закрытие',
        openAnother: 'Открыть другую панель',
        position: 'Позиция',
        closeSidepanel: 'Закрыть панель',
        openSidepanel: 'Открыть панель',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        button: 'Кнопка',
        action: 'Действие'
    },
    default: {
        sidepanel: 'Sidepanel',
        stateSaving: 'Sidepanel state saving',
        userInfo: 'User info',
        name: 'Name:',
        role: 'Role:',
        administrator: 'Administrator',
        header: 'Header',
        close: 'Close',
        open: 'Open',
        disableClose: 'Disable close',
        openAnother: 'Open another sidepanel',
        position: 'Position',
        closeSidepanel: 'Close sidepanel',
        openSidepanel: 'Open sidepanel',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        button: 'Button',
        action: 'Action'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
