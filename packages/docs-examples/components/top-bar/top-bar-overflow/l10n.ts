import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the top-bar-overflow example. */
export interface ExampleText {
    page: string;
    description: string;
    status: string;
    additionalInformation: string;
    badge: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        page: 'Страница',
        description: 'Описание',
        status: 'Статус',
        additionalInformation: 'Дополнительная информация',
        badge: 'Бейдж'
    },
    default: {
        page: 'Page',
        description: 'Description',
        status: 'Status',
        additionalInformation: 'Additional Information',
        badge: 'Badge'
    }
};
