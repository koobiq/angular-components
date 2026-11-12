import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the accordion-in-panel example. */
export interface ExampleText {
    content: string;
    profile: string;
    specifications: string;
    servers: string;
    data: string;
    note: string;
    panel: string;
    openPanel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        data: 'Данные',
        note: 'Заметка',
        panel: 'Панель',
        openPanel: 'Открыть панель с аккордеоном'
    },
    default: {
        content: 'This text illustrates the inner content of the accordion section',
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        data: 'Data',
        note: 'Note',
        panel: 'Panel',
        openPanel: 'Open panel with accordion'
    }
};
