import { inject } from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';

/** @docs-private */
export function createMissingDateImplError(provider: string) {
    return Error(
        `KbqDatepicker: No provider found for ${provider}. You must import one of the existing ` +
            `modules at your application root or provide a custom implementation or use exists ones.`
    );
}

/** Injects `DateAdapter`, naming the missing provider instead of letting DI throw a bare `NullInjectorError`. */
export function injectRequiredDateAdapter<D>(): DateAdapter<D> {
    const adapter = inject<DateAdapter<D>>(DateAdapter, { optional: true });

    if (!adapter) {
        throw createMissingDateImplError('DateAdapter');
    }

    return adapter;
}
