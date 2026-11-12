import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-disable-close example. */
export interface ExampleText {
    close: string;
    open: string;
    sidepanel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        sidepanel: 'Панель'
    },
    default: {
        close: 'Close',
        open: 'Open',
        sidepanel: 'Sidepanel'
    }
};
