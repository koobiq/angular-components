import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-link-overview example. */
export interface ExampleText {
    restore: string;
    request: string;
    assignedToYou: string;
    withInlineLink: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        restore: 'Восстановить',
        request: 'Запрос',
        assignedToYou: 'назначен на вас',
        withInlineLink: 'Тост с гиперссылкой в заголовке'
    },
    default: {
        restore: 'Restore',
        request: 'Request',
        assignedToYou: 'has been assigned to you',
        withInlineLink: 'Toast with an inline link in the title'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
