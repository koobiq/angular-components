import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the toast-link-overview example. */
export interface ExampleText {
    restore: string;
    request: string;
    assignedToYou: string;
    withInlineLink: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
