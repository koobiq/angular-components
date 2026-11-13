import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Translations of one piece of example text: locale ids as keys, `default` as the fallback (English). */
export type Translations<T> = Record<string, T> & { default: T };

/** Signal with the example text in the active locale, falling back to `default`. */
export const injectTranslation = <T>(translations: Translations<T>): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => translations[localeService?.localeId() ?? 'default'] ?? translations.default);
};
