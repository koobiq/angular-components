import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-truncate-tail-items example. */
export interface ExampleText {
    main: string;
    users: string;
    reportNumber: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        main: 'Главная',
        users: 'Пользователи',
        reportNumber: 'Отчёт №123456789'
    },
    default: {
        main: 'Main',
        users: 'Users',
        reportNumber: 'Report №123456789'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
