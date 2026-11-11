import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the list-intermediate-state example. */
export interface ExampleText {
    assignUsers: string;
    user: string;
    nothingFound: string;
    apply: string;
    cancel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
