import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-state-saving example. */
export interface ExampleTranslation {
    stateSaving: string;
    openSidepanel: string;
    closeSidepanel: string;
    resetSavedState: string;
    body: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        stateSaving: 'Сохранение состояния панели',
        openSidepanel: 'Открыть панель',
        closeSidepanel: 'Закрыть панель',
        resetSavedState: 'Сбросить сохранённое состояние',
        body: 'Оставьте панель открытой и перезагрузите страницу — она откроется снова. Панель немодальная, поэтому страница не блокируется, пока она возвращается.'
    },
    default: {
        stateSaving: 'Sidepanel state saving',
        openSidepanel: 'Open sidepanel',
        closeSidepanel: 'Close sidepanel',
        resetSavedState: 'Reset saved state',
        body: 'Leave this panel open and reload the page — it opens again. The panel is non-modal, so nothing on the page is blocked while it comes back.'
    }
};
