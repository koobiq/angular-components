import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the actions-panel-close example. */
export interface ExampleText {
    open: string;
    executeAndClose: string;
    actionInitiated: (action: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        executeAndClose: 'Выполнить и закрыть',
        actionInitiated: (action) => `Действие ${action} инициировано`
    },
    default: {
        open: 'open',
        executeAndClose: 'Execute and close',
        actionInitiated: (action) => `Action initiated ${action}`
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
