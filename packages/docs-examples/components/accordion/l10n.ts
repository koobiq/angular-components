import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the accordion examples. Feature-toggle labels (Icon, Caption, Badge) stay English as demo metadata. */
export interface ExampleText {
    sectionTitle: string;
    content: string;
    profile: string;
    specifications: string;
    servers: string;
    data: string;
    note: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        sectionTitle: 'Текст',
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона',
        profile: 'Профиль',
        specifications: 'Характеристики',
        servers: 'Сервера',
        data: 'Данные',
        note: 'Заметка'
    },
    default: {
        sectionTitle: 'Text',
        content: 'This text illustrates the inner content of the accordion section',
        profile: 'Profile',
        specifications: 'Specifications',
        servers: 'Servers',
        data: 'Data',
        note: 'Note'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
