import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-actions-overview example. */
export interface ExampleText {
    mailServersWindows: string;
    restore: string;
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

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        mailServersWindows: 'Почтовые серверы Windows',
        restore: 'Восстановить',
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
        mailServersWindows: 'Windows mail servers',
        restore: 'Restore',
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
