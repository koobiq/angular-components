import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the list-intermediate-state example. */
export interface ExampleText {
    assignUsers: string;
    user: string;
    nothingFound: string;
    apply: string;
    cancel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        assignUsers: 'Назначить пользователей',
        user: 'Пользователь',
        nothingFound: 'Ничего не найдено',
        apply: 'Применить',
        cancel: 'Отмена'
    },
    default: {
        assignUsers: 'Assign users',
        user: 'User',
        nothingFound: 'Nothing found',
        apply: 'Apply',
        cancel: 'Cancel'
    }
};
