import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown around the app switcher in the examples. The sites and apps stay the same in every locale. */
export interface ExampleText {
    /** Name and tooltip of the trigger. */
    allApps: string;
    /** Caption of the selected application. */
    app: string;
    /** Caption of the selected site. */
    site: string;
}

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> =>
    injectLocalizedText<ExampleText>({
        'ru-RU': { allApps: 'Все приложения', app: 'Приложение:', site: 'Площадка:' },
        default: { allApps: 'All apps', app: 'App:', site: 'Site:' }
    });
