import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the actions-panel-close example. */
export interface ExampleTranslation {
    open: string;
    actionInitiated: (action: string) => string;
    executeAndClose: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
