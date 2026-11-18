import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the before-close example. */
export interface ExampleTranslation {
    open: string;
    title: string;
    name: string;
    discardChangesLabel: string;
    discardChangesContent: string;
    discard: string;
    keepEditing: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        open: 'Открыть',
        title: 'Заголовок',
        name: 'Имя',
        discardChangesLabel: 'Отменить изменения',
        discardChangesContent: 'Отменить несохранённые изменения?',
        discard: 'Отменить',
        keepEditing: 'Продолжить редактирование'
    },
    default: {
        open: 'Open',
        title: 'Title',
        name: 'Name',
        discardChangesLabel: 'Discard changes',
        discardChangesContent: 'Discard unsaved changes?',
        discard: 'Discard',
        keepEditing: 'Keep editing'
    }
};
