import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the toast-actions-overview example. */
export interface ExampleTranslation {
    restore: string;
    mailServersWindows: string;
    view: string;
    reject: string;
    twoActions: string;
    manyActions: string;
    updateAvailableComponents: string;
    title: string;
    subtitleDetails: string;
    captionDeleted: string;
    more: string;
    singleAction: string;
    policy: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        restore: 'Восстановить',
        mailServersWindows: 'Почтовые серверы Windows',
        view: 'Посмотреть',
        reject: 'Отклонить',
        twoActions: 'Два действия',
        manyActions: 'Много действий',
        updateAvailableComponents: 'Доступно обновление компонентов',
        title: 'Заголовок',
        subtitleDetails: 'Подзаголовок, подробности',
        captionDeleted: 'удалена',
        more: 'Еще',
        singleAction: 'Одно действие',
        policy: 'Политика'
    },
    default: {
        restore: 'Restore',
        mailServersWindows: 'Windows mail servers',
        view: 'View',
        reject: 'Reject',
        twoActions: 'Two actions',
        manyActions: 'Many actions',
        updateAvailableComponents: 'Component update available',
        title: 'Title',
        subtitleDetails: 'Subtitle, details',
        captionDeleted: 'deleted',
        more: 'More',
        singleAction: 'Single action',
        policy: 'Policy'
    }
};
