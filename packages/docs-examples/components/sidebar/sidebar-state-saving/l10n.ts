import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidebar-state-saving example. */
export interface ExampleText {
    openedContent: string;
    closedContent: string;
    toggle: string;
    resetSavedState: string;
    stateSavingHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openedContent: 'Содержимое (открыто)',
        closedContent: 'Содержимое (закрыто)',
        toggle: 'Переключить',
        resetSavedState: 'Сбросить сохранённое состояние',
        stateSavingHint:
            'Переключите панель и перезагрузите страницу — она вернётся в том состоянии, в котором была оставлена.'
    },
    default: {
        openedContent: 'Opened content',
        closedContent: 'Closed content',
        toggle: 'Toggle',
        resetSavedState: 'Reset saved state',
        stateSavingHint: 'Toggle the sidebar and reload the page — it comes back the way it was left.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
