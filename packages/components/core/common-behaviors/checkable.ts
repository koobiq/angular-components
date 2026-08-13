import { computed, Directive, forwardRef, InjectionToken, model, Provider, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqCheckedState } from './checkbox';

/**
 * Provider Expression that allows `KbqCheckable` to register as a `ControlValueAccessor`, so any host
 * applying it via `hostDirectives` gets `[(ngModel)]`/`formControl` support without wiring up its own.
 * @docs-private
 */
export const KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqCheckable),
    multi: true
};

/**
 * Click action shared by checkable controls (checkbox, toggle, and custom checkbox-like primitives).
 * noop: Do not toggle checked or indeterminate.
 * check: Only toggle checked status, ignore indeterminate.
 * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
 * undefined: Same as `check-indeterminate`.
 */
export type KbqCheckableClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

/** Injection token that can be used to specify the default click behavior for checkable controls. */
export const KBQ_CHECKABLE_CLICK_ACTION = new InjectionToken<KbqCheckableClickAction>('kbq-checkable-click-action');

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
    /** The initial state of the component before any user interaction. */
    Init = 'init',
    /** The state representing the component when it's becoming checked. */
    Checked = 'checked',
    /** The state representing the component when it's becoming unchecked. */
    Unchecked = 'unchecked',
    /** The state representing the component when it's becoming indeterminate. */
    Indeterminate = 'indeterminate'
}

/** Result of resolving a click on a checkable control's native input. See {@link KbqCheckable.resolveClick}. */
export interface KbqCheckableClickResult {
    /** Whether `checked` should be toggled and a `change` event emitted. */
    readonly shouldToggle: boolean;
    /** Whether `indeterminate` should be cleared and an `indeterminateChange` event emitted. */
    readonly shouldClearIndeterminate: boolean;
}

/**
 * Shared behavior for checkbox-like controls: checked/disabled/indeterminate/tabIndex state, the click-to-toggle
 * algorithm, ARIA-checked computation, and `ControlValueAccessor` change plumbing.
 *
 * Meant to be applied via `hostDirectives` by components that render their own native `<input type="checkbox">`
 * and markup (e.g. `KbqCheckbox`, `KbqToggleComponent`, or custom checkbox-like primitives). Hosts stay
 * responsible for their own public inputs/outputs, `FocusMonitor` wiring, and emitting their own typed
 * `change` event - this directive only centralizes the state and decisions behind them.
 */
@Directive({
    selector: '[kbqCheckable]',
    providers: [KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR],
    exportAs: 'kbqCheckable'
})
export class KbqCheckable implements ControlValueAccessor {
    private controlValueAccessorChangeFn: (value: any) => void = () => {};

    /**
     * Called when the control is blurred. Needed to properly implement `ControlValueAccessor`.
     * @docs-private
     */
    onTouched: () => any = () => {};

    /** @docs-private */
    readonly currentCheckState = signal<TransitionCheckState>(TransitionCheckState.Init);

    readonly checked = model(false);

    readonly disabled = model(false);

    readonly indeterminate = model(false);

    /** Raw tab index as set by the caller, ignoring `disabled`. Use `effectiveTabIndex` to read the applied value. */
    readonly tabIndex = model(0);

    /** The tab index actually applied to the native input: forced to `-1` while disabled. */
    readonly effectiveTabIndex = computed(() => (this.disabled() ? -1 : this.tabIndex()));

    /** Returns the ARIA-checked value: `'true'`, `'false'`, or `'mixed'` when indeterminate. */
    getAriaChecked(): KbqCheckedState {
        return this.checked() ? 'true' : this.indeterminate() ? 'mixed' : 'false';
    }

    /** Toggles the `checked` state and notifies the registered `ControlValueAccessor` change handler. */
    toggle(): void {
        this.checked.update((value) => !value);
        this.notifyFormValueChange(this.checked());
    }

    /**
     * Resolves what a click on the native input should do, based on the current state and `clickAction`.
     * Pure - does not mutate state. Callers apply `checked`/`indeterminate` themselves and own emitting
     * their own change events, so timing/order stays identical to a hand-written click handler.
     */
    resolveClick(clickAction: KbqCheckableClickAction): KbqCheckableClickResult {
        if (this.disabled() || clickAction === 'noop') {
            return { shouldToggle: false, shouldClearIndeterminate: false };
        }

        return {
            shouldToggle: true,
            shouldClearIndeterminate: this.indeterminate() && clickAction !== 'check'
        };
    }

    /** Resets the native input to match the current `checked`/`indeterminate` state (used for the `noop` click action). */
    resetNativeInput(nativeInput: HTMLInputElement): void {
        nativeInput.checked = this.checked();
        nativeInput.indeterminate = this.indeterminate();
    }

    /** Transitions the animation state, ignoring no-op transitions. @docs-private */
    transitionCheckState(newState: TransitionCheckState): void {
        if (this.currentCheckState() === newState) return;

        this.currentCheckState.set(newState);
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any): void {
        this.checked.set(!!value);
    }

    /** Stores the `ControlValueAccessor` change handler to be notified by `notifyFormValueChange`. */
    registerOnChange(fn: (value: any) => void): void {
        this.controlValueAccessorChangeFn = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    /** Notifies the registered `ControlValueAccessor` change handler. */
    notifyFormValueChange(value: boolean): void {
        this.controlValueAccessorChangeFn(value);
    }
}
