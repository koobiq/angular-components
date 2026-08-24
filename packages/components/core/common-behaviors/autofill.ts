import { AutofillMonitor } from '@angular/cdk/text-field';
import { DestroyRef, ElementRef, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Tracks whether the current control's value was filled in by the browser, as a signal.
 *
 * Call it from an injection context on a directive whose host is the element the browser actually
 * fills — a text `<input>` or a `<textarea>`. Every `KbqFormFieldControl` that can be autofilled
 * exposes the result as its `autofilled` member.
 *
 * This is a hook for application code, not the mechanism behind the autofill styling. The styling
 * keys on `:autofill` in CSS, which matches in the same style pass the browser fills the field;
 * detection here goes through a zero-length keyframe animation and an `animationstart` listener, so
 * it lands a frame or two later — too late to paint with, and early enough for anything a component
 * wants to do about it.
 *
 * `monitor()` returns EMPTY off the browser platform, so this needs no `Platform` guard.
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

    // `stopMonitoring()` is the load-bearing teardown, not a duplicate of `takeUntilDestroyed()`
    // above: `AutofillMonitor` is `providedIn: 'root'`, so dropping only the subscription would
    // leave the element registered with the app-lifetime service and its marker classes on the DOM
    // node.
    destroyRef.onDestroy(() => autofillMonitor.stopMonitoring(elementRef));

    return autofilled.asReadonly();
};
