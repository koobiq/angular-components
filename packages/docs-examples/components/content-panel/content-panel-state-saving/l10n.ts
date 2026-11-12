import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the content-panel-state-saving example. */
export interface ExampleText {
    toggle: string;
    title: string;
    resetSavedState: string;
    stateSavingHint: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        toggle: 'Переключить',
        title: 'Заголовок',
        resetSavedState: 'Сбросить сохранённое состояние',
        stateSavingHint:
            'Откройте панель и перетащите её левый край, затем перезагрузите страницу — панель вернётся открытой и с той шириной, на которой её оставили. Двойной щелчок по краю восстанавливает заявленную ширину, и это тоже запоминается.'
    },
    default: {
        toggle: 'Toggle',
        title: 'Title',
        resetSavedState: 'Reset saved state',
        stateSavingHint:
            'Open the panel and drag its left edge, then reload the page — the panel comes back open and at the width it was left. Double-clicking the edge restores the declared width, and that is remembered too.'
    }
};
