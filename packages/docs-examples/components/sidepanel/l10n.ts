import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the sidepanel examples. Position and size names (Right, Small) stay English as API values. */
export interface ExampleText {
    close: string;
    open: string;
    position: string;
    templateContent: string;
    templateBody: string;
    button: string;
    action: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        position: 'Позиция',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        button: 'Кнопка',
        action: 'Действие'
    },
    default: {
        close: 'Close',
        open: 'Open',
        position: 'Position',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        button: 'Button',
        action: 'Action'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
