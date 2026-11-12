import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the actions-panel-close example. */
export interface ExampleText {
    open: string;
    actionInitiated: (action: string) => string;
    executeAndClose: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        open: 'открыть',
        actionInitiated: (action) => `Действие ${action} инициировано`,
        executeAndClose: 'Выполнить и закрыть'
    },
    default: {
        open: 'open',
        actionInitiated: (action) => `Action initiated ${action}`,
        executeAndClose: 'Execute and close'
    }
};
