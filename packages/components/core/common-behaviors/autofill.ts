import { AutofillMonitor } from '@angular/cdk/text-field';
import { DestroyRef, ElementRef, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Tracks whether the current control's value was filled in by the browser, as a signal.
 *
 * Call it from an injection context on a directive whose host is the element the browser actually
 * fills — a text `<input>` or a `<textarea>`. Every `KbqFormFieldControl` that can be autofilled
 * exposes the result as its `autofilled` member, which the form field reads to toggle
 * `kbq-form-field_autofilled`.
 *
 * The CDK detects autofill by running a zero-length keyframe animation on `:-webkit-autofill` and
 * listening for `animationstart`; `monitor()` returns EMPTY off the browser platform, so this needs no
 * `Platform` guard.
 */
export const kbqInjectAutofilled = (): Signal<boolean> => {
    const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    const autofillMonitor = inject(AutofillMonitor);
    const destroyRef = inject(DestroyRef);
    const autofilled = signal(false);

    autofillMonitor
        .monitor(elementRef)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(({ isAutofilled }) => autofilled.set(isAutofilled));

    // `stopMonitoring()` is the load-bearing teardown, not a duplicate of `takeUntilDestroyed()` above:
    // `AutofillMonitor` is `providedIn: 'root'`, so dropping only the subscription would leave the
    // element registered with the app-lifetime service and its marker classes on the DOM node.
    destroyRef.onDestroy(() => autofillMonitor.stopMonitoring(elementRef));

    return autofilled.asReadonly();
};
