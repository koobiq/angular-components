import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the accordion examples. Feature-toggle labels (Icon, Caption, Badge) stay English as demo metadata. */
export interface ExampleText {
    content: string;
    profile: string;
    specifications: string;
    servers: string;
    data: string;
    note: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        data: 'Данные',
        note: 'Заметка'
    },
    default: {
        content: 'This text illustrates the inner content of the accordion section',
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        data: 'Data',
        note: 'Note'
    }
};
