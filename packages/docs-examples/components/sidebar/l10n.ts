import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the sidebar examples. */
export interface ExampleText {
    leftOpenedContent: string;
    leftClosedContent: string;
    rightOpenedContent: string;
    rightClosedContent: string;
    openedContent: string;
    closedContent: string;
    mainContent: string;
    toggleLeftModel: string;
    toggleLeft: string;
    toggleRightModel: string;
    toggleRight: string;
    toggleModel: string;
    toggle: string;
    resetSavedState: string;
    stateSavingHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        leftOpenedContent: 'Содержимое левой панели (открыта)',
        leftClosedContent: 'Содержимое левой панели (закрыта)',
        rightOpenedContent: 'Содержимое правой панели (открыта)',
        rightClosedContent: 'Содержимое правой панели (закрыта)',
        openedContent: 'Содержимое (открыто)',
        closedContent: 'Содержимое (закрыто)',
        mainContent: 'Основное содержимое',
        toggleLeftModel: 'Переключить левую модель',
        toggleLeft: 'Переключить левую',
        toggleRightModel: 'Переключить правую модель',
        toggleRight: 'Переключить правую',
        toggleModel: 'Переключить модель',
        toggle: 'Переключить',
        resetSavedState: 'Сбросить сохранённое состояние',
        stateSavingHint:
            'Переключите панель и перезагрузите страницу — она вернётся в том состоянии, в котором была оставлена.'
    },
    default: {
        leftOpenedContent: 'Left opened content',
        leftClosedContent: 'Left closed content',
        rightOpenedContent: 'Right opened content',
        rightClosedContent: 'Right closed content',
        openedContent: 'Opened content',
        closedContent: 'Closed content',
        mainContent: 'Main content',
        toggleLeftModel: 'Toggle left model',
        toggleLeft: 'Toggle left',
        toggleRightModel: 'Toggle right model',
        toggleRight: 'Toggle right',
        toggleModel: 'Toggle model',
        toggle: 'Toggle',
        resetSavedState: 'Reset saved state',
        stateSavingHint: 'Toggle the sidebar and reload the page — it comes back the way it was left.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
