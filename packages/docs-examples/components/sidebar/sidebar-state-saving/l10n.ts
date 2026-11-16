import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidebar-state-saving example. */
export interface ExampleTranslation {
    openedContent: string;
    closedContent: string;
    toggle: string;
    resetSavedState: string;
    stateSavingHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
