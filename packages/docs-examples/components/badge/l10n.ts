import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the badge examples. Color and size names (Theme, Fade Error, Compact) stay English as API names. */
export interface ExampleText {
    normal: string;
    badge: string;
    horizontal: string;
    vertical: string;
    column: (index: number) => string;
    value: string;
    link: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        normal: 'Обычный',
        badge: 'Бейдж',
        horizontal: 'Горизонтально',
        vertical: 'Вертикально',
        column: (index) => `Столбец ${index}`,
        value: 'Значение',
        link: 'Ссылка'
    },
    default: {
        normal: 'Normal',
        badge: 'Badge',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        column: (index) => `Column ${index}`,
        value: 'Value',
        link: 'Link'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
