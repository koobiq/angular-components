import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the accordion-interactive-elements example. */
export interface ExampleText {
    profile: string;
    specifications: string;
    servers: string;
    apply: string;
    enabled: string;
    name: string;
    rename: string;
    duplicate: string;
    delete: string;
    run: (title: string) => string;
    moreActionsFor: (title: string) => string;
    keyboardHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        apply: 'Применить',
        enabled: 'Включено',
        name: 'Имя',
        rename: 'Переименовать',
        duplicate: 'Дублировать',
        delete: 'Удалить',
        run: (title) => `Запустить ${title}`,
        moreActionsFor: (title) => `Другие действия для ${title}`,
        keyboardHint: 'Enter и Space переключают секцию, только когда фокус на самом триггере'
    },
    default: {
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        apply: 'Apply',
        enabled: 'Enabled',
        name: 'Name',
        rename: 'Rename',
        duplicate: 'Duplicate',
        delete: 'Delete',
        run: (title) => `Run ${title}`,
        moreActionsFor: (title) => `More actions for ${title}`,
        keyboardHint: 'Enter and Space toggle the section only while the trigger itself is focused'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
