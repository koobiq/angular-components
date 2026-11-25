import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-can-close example. */
export interface ExampleTranslation {
    open: string;
    title: string;
    name: string;
    save: string;
    confirmTitle: string;
    confirmContent: string;
    discard: string;
    keepEditing: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        open: 'Открыть панель',
        title: 'Редактирование',
        name: 'Имя',
        save: 'Сохранить',
        confirmTitle: 'Несохранённые изменения',
        confirmContent: 'Закрыть без сохранения?',
        discard: 'Закрыть без сохранения',
        keepEditing: 'Продолжить редактирование'
    },
    default: {
        open: 'Open sidepanel',
        title: 'Editing',
        name: 'Name',
        save: 'Save',
        confirmTitle: 'Unsaved changes',
        confirmContent: 'Close without saving?',
        discard: 'Close without saving',
        keepEditing: 'Keep editing'
    }
};
