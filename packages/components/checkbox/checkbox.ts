import { _IdGenerator, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    output,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqCheckable, KbqCheckedState, KbqColorDirective, TransitionCheckState } from '@koobiq/components/core';
import { KBQ_CHECKBOX_CLICK_ACTION, KbqCheckboxClickAction } from './checkbox-config';

/**
 * Re-exported for backwards compatibility - `TransitionCheckState` moved to `@koobiq/components/core`
 * so it can be shared with `KbqToggleComponent`. Existing code importing it from here keeps working.
 * @docs-private
 * @deprecated Use `TransitionCheckState` from `@koobiq/components/core` instead.
 */
export { TransitionCheckState };

/**
 * Provider Expression that allows kbq-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 * @deprecated Unused - the `ControlValueAccessor` is now registered by the `KbqCheckable` host directive.
 */
export const KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqCheckbox),
    multi: true
};

/** Change event object emitted by KbqCheckbox. */
export class KbqCheckboxChange {
    /** The source KbqCheckbox of the event. */
    source: KbqCheckbox;
    /** The new `checked` value of the checkbox. */
    checked: boolean;
}

/**
 * A Koobiq checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A KbqCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 */
@Component({
    selector: 'kbq-checkbox',
    imports: [
        CdkObserveContent
    ],
    templateUrl: 'checkbox.html',
    styleUrls: ['checkbox.scss', 'checkbox-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-checkbox',
        '[id]': 'hostId()',
        '[attr.id]': 'hostId()',
        '[attr.disabled]': 'disabled',
        '[class.kbq-checkbox_big]': 'big()',
        '[class.kbq-indeterminate]': 'indeterminate',
        '[class.kbq-checked]': 'checked',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-checkbox_label-before]': 'labelPosition() == "before"'
    },
    hostDirectives: [KbqCheckable],
    exportAs: 'kbqCheckbox'
})
export class KbqCheckbox extends KbqColorDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly checkable = inject(KbqCheckable, { self: true });

    private readonly uniqueId = inject(_IdGenerator).getId('kbq-checkbox-');

    /** Whether the checkbox uses the big size. */
    readonly big = input(false, { transform: booleanAttribute });

    /**
     * A unique id for the checkbox input. If none is supplied — or `null` is bound explicitly — it is
     * auto-generated.
     */
    readonly id = input<string | null>(this.uniqueId);

    /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
    readonly labelPosition = input<'before' | 'after'>('after');

    /** Name value will be applied to the input element if present */
    readonly name = input<string | null>(null);

    /** Event emitted when the checkbox's `checked` value changes. */
    readonly change = output<KbqCheckboxChange>();

    /** Event emitted when the checkbox's `indeterminate` value changes. */
    readonly indeterminateChange = output<boolean>();

    /** The value attribute of the native input element */
    readonly value = input<string>();

    /** Defines the behavior when a user clicks on the checkbox. */
    readonly clickAction = input<KbqCheckboxClickAction>(
        inject(KBQ_CHECKBOX_CLICK_ACTION, { optional: true }) || undefined
    );

    /** The native `<input type="checkbox">` element */
    protected readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');

    /**
     * Id applied to the host. Falls back to the generated id, so an explicit `null` still yields an id
     * the visually hidden input can point its `for` at.
     *
     * @docs-private
     */
    protected readonly hostId = computed(() => this.id() || this.uniqueId);

    /**
     * Id of the visually hidden native input.
     *
     * @docs-private
     */
    protected readonly inputId = computed(() => `${this.hostId()}-input`);

    /** Whether the checkbox is required. */
    readonly required = input(false, { transform: booleanAttribute });

    /**
     * Whether the checkbox is checked.
     */
    // `checked` is two-way state: the component writes it on click and the `ControlValueAccessor` writes it
    // through `KbqCheckable`. A `model()` cannot carry a transform, so this stays an accessor input over the
    // shared signal — the same shape the reviewed `KbqButtonToggle` settled on.
    @Input({ transform: booleanAttribute })
    get checked(): boolean {
        return this.checkable.checked();
    }

    set checked(value: boolean) {
        this.checkable.checked.set(value);
    }

    /** Whether the checkbox is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.checkable.disabled();
    }

    set disabled(value: boolean) {
        this.checkable.disabled.set(value);
    }

    /** Tab order of the native input. A disabled checkbox is taken out of the tab order regardless. */
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.checkable.effectiveTabIndex();
    }

    set tabIndex(value: number) {
        this.checkable.tabIndex.set(value);
    }

    /**
     * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    @Input({ transform: booleanAttribute })
    get indeterminate(): boolean {
        return this.checkable.indeterminate();
    }

    set indeterminate(value: boolean) {
        const changed = value !== this.checkable.indeterminate();

        this.checkable.indeterminate.set(value);

        if (changed) {
            this.checkable.transitionCheckState(
                this.checkable.indeterminate()
                    ? TransitionCheckState.Indeterminate
                    : this.checked
                      ? TransitionCheckState.Checked
                      : TransitionCheckState.Unchecked
            );

            this.indeterminateChange.emit(value);
        }
    }

    /**
     * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
     * @docs-private
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    onTouched: () => any = () => {};

    ngAfterViewInit() {
        this.focusMonitor
            .monitor(this.inputElement().nativeElement)
            .subscribe((focusOrigin) => this.onInputFocusChange(focusOrigin));
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.inputElement().nativeElement);
    }

    /**
     * Method being called whenever the label text changes.
     *
     * @docs-private
     */
    protected onLabelTextChange(): void {
        // This method is getting called whenever the label of the checkbox changes.
        // Since the checkbox uses the OnPush strategy we need to notify it about the change
        // that has been recognized by the cdkObserveContent directive.
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    writeValue(value: any) {
        this.checkable.checked.set(!!value);
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    registerOnChange(fn: (value: any) => void) {
        this.checkable.registerOnChange(fn);
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    registerOnTouched(fn: any) {
        this.checkable.registerOnTouched(fn);
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    setDisabledState(isDisabled: boolean) {
        this.checkable.disabled.set(isDisabled);
    }

    /** @docs-private */
    protected getAriaChecked(): KbqCheckedState {
        return this.checkable.getAriaChecked();
    }

    /** Toggles the `checked` state of the checkbox. */
    toggle(): void {
        this.checkable.toggle();
    }

    /**
     * Event handler for checkbox input element.
     * Toggles checked state if element is not disabled.
     * Do not toggle on (change) event since IE doesn't fire change event when
     *   indeterminate checkbox is clicked.
     * @param event Input click event
     * @docs-private
     */
    protected onInputClick(event: Event): void {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `checkbox` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        const { shouldToggle, shouldClearIndeterminate } = this.checkable.resolveClick(this.clickAction());

        if (shouldToggle) {
            // When user manually click on the checkbox, `indeterminate` is set to false.
            if (shouldClearIndeterminate) {
                Promise.resolve().then(() => {
                    this.checkable.indeterminate.set(false);
                    this.indeterminateChange.emit(false);
                });
            }

            this.toggle();
            this.checkable.transitionCheckState(
                this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked
            );

            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this.emitChangeEvent();
        } else if (!this.disabled) {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `kbq-checkbox`.
            this.checkable.resetNativeInput(this.inputElement().nativeElement);
        }
    }

    /** Focuses the checkbox. */
    focus(): void {
        this.focusMonitor.focusVia(this.inputElement().nativeElement, 'keyboard');
    }

    /** @docs-private */
    protected onInteractionEvent(event: Event): void {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();
    }

    private emitChangeEvent() {
        // Note: `toggle()` already notifies the ControlValueAccessor change handler via `KbqCheckable.toggle()`.
        const event = new KbqCheckboxChange();

        event.source = this;
        event.checked = this.checked;

        this.change.emit(event);
    }

    /** Function is called whenever the focus changes for the input element. */
    private onInputFocusChange(focusOrigin: FocusOrigin) {
        if (focusOrigin) {
            this.checkable.onTouched();
        }
    }
}
