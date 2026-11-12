import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-with-dynamic-config-update example. */
export interface ExampleText {
    close: string;
    open: string;
    header: string;
    disableClose: string;
    openAnother: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        header: 'Заголовок',
        disableClose: 'Отключить закрытие',
        openAnother: 'Открыть другую панель'
    },
    default: {
        close: 'Close',
        open: 'Open',
        header: 'Header',
        disableClose: 'Disable close',
        openAnother: 'Open another sidepanel'
    }
};
