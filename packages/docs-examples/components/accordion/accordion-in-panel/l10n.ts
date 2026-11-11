import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the accordion-in-panel example. */
export interface ExampleText {
    content: string;
    panel: string;
    openPanel: string;
    profile: string;
    specifications: string;
    servers: string;
    data: string;
    note: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        panel: 'Панель',
        openPanel: 'Открыть панель с аккордеоном',
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        data: 'Данные',
        note: 'Заметка'
    },
    default: {
        content: 'This text illustrates the inner content of the accordion section',
        panel: 'Panel',
        openPanel: 'Open panel with accordion',
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        data: 'Data',
        note: 'Note'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
