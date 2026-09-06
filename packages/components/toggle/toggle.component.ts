import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    output,
    Signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { KBQ_CHECKBOX_CLICK_ACTION } from '@koobiq/components/checkbox';
import {
    KBQ_CHECKABLE_CLICK_ACTION,
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqCheckable,
    KbqCheckableClickAction,
    KbqCheckedState,
    KbqColorDirective,
    TransitionCheckState
} from '@koobiq/components/core';

let nextUniqueId = 0;

/** Position of the label relative to the switch. */
export type ToggleLabelPositionType = 'left' | 'right';

/** Change event object emitted by `KbqToggleComponent`. */
export class KbqToggleChange {
    /** The source toggle of the event. */
    source: KbqToggleComponent;
    /** The new `checked` value of the toggle. */
    checked: boolean;
}

/**
 * Toggle click action when user click on input element. Alias of `KbqCheckableClickAction`.
 */
export type KbqToggleClickAction = KbqCheckableClickAction;

@Component({
    selector: 'kbq-toggle',
    imports: [
        CdkObserveContent
    ],
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.scss', './toggle-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toggle',
        '[class.kbq-toggle_big]': 'big()',
        '[attr.id]': 'id || uniqueId',
        '[class.kbq-disabled]': 'disabled || loading()',
        '[class.kbq-toggle_loading]': 'loading()',
        '[class.kbq-active]': 'checked',
        '[class.kbq-indeterminate]': 'indeterminate'
    },
    hostDirectives: [KbqCheckable],
    animations: [
        trigger('switch', [
            state(TransitionCheckState.Init, style({ left: '3px' })),
            state(TransitionCheckState.Unchecked, style({ left: '3px' })),
            state(TransitionCheckState.Indeterminate, style({ left: '10px', visibility: 'hidden' })),
            state(TransitionCheckState.Checked, style({ left: 'calc(100% - 11px)' })),
            transition(
                `${TransitionCheckState.Init} => ${TransitionCheckState.Checked}`,
                animate(KbqAnimationDurations.Entering)
            ),
            transition(
                `${TransitionCheckState.Checked} <=> ${TransitionCheckState.Unchecked}`,
                animate(KbqAnimationDurations.Rapid)
            ),
            transition(
                `${TransitionCheckState.Indeterminate} => *`,
                animate(`${KbqAnimationDurations.Instant} ${KbqAnimationCurves.EaseInOut}`)
            )
        ])
    ],
    exportAs: 'kbqToggle'
})
export class KbqToggleComponent extends KbqColorDirective implements AfterViewInit, ControlValueAccessor, OnDestroy {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly checkable = inject(KbqCheckable, { self: true });
    private readonly destroyRef = inject(DestroyRef);

    readonly big = input<boolean>(false);

    readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');

    readonly labelPosition = input<ToggleLabelPositionType>('right');

    readonly ariaLabel = input<string>('', { alias: 'aria-label' });
    readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input() id: string;

    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    readonly name = input<string | null>(null);

    readonly value = input<string | undefined>(undefined);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.checkable.disabled();
    }

    set disabled(value: boolean) {
        this.checkable.disabled.set(value);
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.checkable.effectiveTabIndex();
    }

    set tabIndex(value: number) {
        this.checkable.tabIndex.set(value);
    }

    get checked(): boolean {
        return this.checkable.checked();
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    set checked(value: boolean) {
        if (value !== this.checkable.checked()) {
            this.checkable.checked.set(value);
            this.setTransitionCheckState();
        }
    }

    /**
     * Whether the toggle is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get indeterminate(): boolean {
        return this.checkable.indeterminate();
    }

    set indeterminate(value: boolean) {
        const changed = value !== this.checkable.indeterminate();

        this.checkable.indeterminate.set(value);

        if (changed) {
            this.setTransitionCheckState();
            this.indeterminateChange.emit(value);
        }
    }

    /**
     * Property for manually set loading state.
     */
    readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly change = output<KbqToggleChange>();

    /** Event emitted when the toggle's `indeterminate` value changes. */
    readonly indeterminateChange = output<boolean>();

    /** @docs-private */
    protected readonly currentCheckState: Signal<TransitionCheckState> = this.checkable.currentCheckState;

    /** Defines the behavior when a user clicks on the toggle. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    // `KBQ_CHECKBOX_CLICK_ACTION` is the legacy fallback, kept for apps that already configure it globally
    // to control click behavior for both checkbox and toggle.
    @Input() clickAction: KbqToggleClickAction =
        inject(KBQ_CHECKABLE_CLICK_ACTION, { optional: true }) ??
        inject(KBQ_CHECKBOX_CLICK_ACTION, { optional: true }) ??
        undefined;

    protected readonly uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    constructor() {
        super();

        this.id = this.uniqueId;

        // `writeValue` (ngModel/formControl) now runs on `KbqCheckable`, bypassing the `checked`/`indeterminate`
        // setters below, so this keeps the `[@switch]` animation state in sync for form-driven value changes too.
        effect(() => this.setTransitionCheckState());
    }

    ngAfterViewInit(): void {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            // Interacting with the control marks it as touched even when the value does not change.
            .subscribe((origin) => origin && this.checkable.onTouched());
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.focusMonitor.focusVia(this.inputElement().nativeElement, 'keyboard');
    }

    getAriaChecked(): KbqCheckedState {
        return this.checkable.getAriaChecked();
    }

    onChangeEvent(event: Event) {
        event.stopPropagation();
    }

    onLabelTextChange() {
        this.changeDetectorRef.markForCheck();
    }

    onInputClick(event: MouseEvent) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `toggle` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        // While loading the toggle declines the click, but the native input still has to be reset,
        // so the state is resolved as `noop` instead of returning early.
        const { shouldToggle, shouldClearIndeterminate } = this.checkable.resolveClick(
            this.loading() ? 'noop' : this.clickAction
        );

        if (shouldToggle) {
            // When user manually click on the toggle, `indeterminate` is set to false.
            if (shouldClearIndeterminate) {
                Promise.resolve().then(() => {
                    this.checkable.indeterminate.set(false);
                    this.indeterminateChange.emit(false);
                });
            }

            this.checkable.toggle();
            this.checkable.onTouched();
            this.checkable.transitionCheckState(
                this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked
            );
            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this.emitChangeEvent();
        } else if (!this.disabled) {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `kbq-toggle`.
            this.checkable.resetNativeInput(this.inputElement().nativeElement);
        }
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    writeValue(value: any) {
        this.checked = !!value;
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * @deprecated Unused - `ControlValueAccessor` is now implemented by the `KbqCheckable` host directive,
     * so this is never called by Angular forms. Will be removed in the next major version.
     */
    registerOnChange(fn: any) {
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
        this.disabled = isDisabled;
    }

    /** Id of the element wrapping the projected hint, referenced by the input's `aria-describedby`. */
    protected get hintId(): string {
        return `${this.id || this.uniqueId}-hint`;
    }

    /** A native checkbox only reacts to Space, so Enter is forwarded to it manually. */
    protected onEnterKeydown(event: Event): void {
        // Without this the same keystroke also submits the enclosing form.
        event.preventDefault();

        this.inputElement().nativeElement.click();
    }

    private setTransitionCheckState() {
        if (this.indeterminate) {
            this.checkable.transitionCheckState(TransitionCheckState.Indeterminate);
        } else {
            this.checkable.transitionCheckState(
                this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked
            );
        }
    }

    private emitChangeEvent() {
        // Note: `toggle()` already notifies the ControlValueAccessor change handler via `KbqCheckable.toggle()`.
        const event = new KbqToggleChange();

        event.source = this;
        event.checked = this.checked;

        this.change.emit(event);
    }
}
