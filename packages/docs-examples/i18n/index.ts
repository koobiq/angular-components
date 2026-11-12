import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Translations of one piece of example text: locale ids as keys, `default` as the fallback (English). */
export type LocalizedText<T> = Record<string, T> & { default: T };

/** Signal with the example text in the active locale, falling back to `default`. */
export const injectLocalizedText = <T>(data: LocalizedText<T>): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Base class of an example with localized text: `this.text` is a signal following the active locale. */
export abstract class BaseLocalizedExample<T> {
    protected readonly text: Signal<T>;

    protected constructor(text: LocalizedText<T>) {
        this.text = injectLocalizedText(text);
    }
}
