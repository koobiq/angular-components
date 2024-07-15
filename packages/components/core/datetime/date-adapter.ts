import { inject, InjectionToken, LOCALE_ID } from '@angular/core';
import { DateAdapter as BaseDateAdapter } from '@koobiq/date-adapter';
import { BehaviorSubject, Observable } from 'rxjs';

/** InjectionToken for datepicker that can be used to override default locale code. */
export const KBQ_DATE_LOCALE = new InjectionToken<string>('KBQ_DATE_LOCALE', {
    providedIn: 'root',
    factory: KBQ_DATE_LOCALE_FACTORY,
});

/** @docs-private */
// tslint:disable-next-line:naming-convention
export function KBQ_DATE_LOCALE_FACTORY(): string {
    return inject(LOCALE_ID);
}

export abstract class DateAdapter<D> extends BaseDateAdapter<D> {
    /** A stream that emits when the locale changes. */
    abstract get localeChanges(): Observable<any>;

    protected abstract _localeChanges: BehaviorSubject<string>;
}
