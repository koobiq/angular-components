import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-truncate-center-items example. */
export interface ExampleText {
    users: string;
    groups: string;
    reportDated: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        users: 'Пользователи',
        groups: 'Группы',
        reportDated: 'Отчёт от 28.08.2018'
    },
    default: {
        users: 'Users',
        groups: 'Groups',
        reportDated: 'Report dated 28.08.2018'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
