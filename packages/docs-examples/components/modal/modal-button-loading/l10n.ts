import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-button-loading example. */
export interface ExampleTranslation {
    open: string;
    serverLabel: string;
    required: string;
    invalidUrl: string;
    connected: string;
    notConnected: string;
    save: string;
    cancel: string;
    check: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        open: 'Открыть модальное окно',
        serverLabel: 'Адрес сервера',
        required: 'Укажите адрес сервера',
        invalidUrl: 'Неверный формат адреса',
        connected: 'Подключение установлено',
        notConnected: 'Подключение не установлено',
        save: 'Сохранить',
        cancel: 'Отмена',
        check: 'Проверить подключение'
    },
    default: {
        open: 'Open modal',
        serverLabel: 'Server address',
        required: 'Specify the server address',
        invalidUrl: 'Invalid address format',
        connected: 'Connection established',
        notConnected: 'Connection not established',
        save: 'Save',
        cancel: 'Cancel',
        check: 'Check connection'
    }
};
