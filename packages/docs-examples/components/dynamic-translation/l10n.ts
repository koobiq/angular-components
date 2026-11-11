import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the dynamic translation examples. */
export interface ExampleText {
    message: string;
    registered: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        message: 'Инцидент создан. [[link:Откройте в новой вкладке]], чтобы продолжить работу.',
        registered: 'Зарегистрировано инцидентов: [[bold:1000]].'
    },
    default: {
        message: 'Incident created. [[link:Open in a new tab]] to continue working.',
        registered: '[[bold:1000]] incidents have been registered.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
