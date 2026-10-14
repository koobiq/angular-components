import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    OnChanges,
    OnDestroy,
    output,
    Signal,
    SimpleChanges,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_CHECKBOX_CLICK_ACTION } from '@koobiq/components/checkbox';
import {
    KBQ_CHECKABLE_CLICK_ACTION,
    kbqAnimationsDisabled,
    KbqCheckable,
    KbqCheckableClickAction,
    KbqCheckedState,
    KbqColorDirective,
    kbqOptionalNumberAttribute,
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
    exportAs: 'kbqToggle'
})
export class KbqToggleComponent extends KbqColorDirective implements OnChanges, AfterViewInit, OnDestroy {
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly checkable = inject(KbqCheckable, { self: true });
    private readonly destroyRef = inject(DestroyRef);

    readonly big = input<boolean>(false);

    readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');

    readonly labelPosition = input<ToggleLabelPositionType>('right');

    readonly ariaLabel = input<string>('', { alias: 'aria-label' });
    readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

    id: string;

    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    readonly name = input<string | null>(null);

    readonly value = input<string | undefined>(undefined);

    get disabled(): boolean {
        return this.checkable.disabled();
    }

    set disabled(value: boolean) {
        this.checkable.disabled.set(value);
    }

    get tabIndex(): number {
        return this.checkable.effectiveTabIndex();
    }

    set tabIndex(value: number) {
        this.checkable.tabIndex.set(value);
    }

    get checked(): boolean {
        return this.checkable.checked();
    }

    set checked(value: boolean) {
        // Untracked, as the `indeterminate` setter: an `effect()` that assigns it must not come to depend on `checked`
        // and `indeterminate`, read on the way.
        untracked(() => {
            if (value !== this.checkable.checked()) {
                this.checkable.checked.set(value);
                this.setTransitionCheckState();
            }
        });
    }

    /**
     * Whether the toggle is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    get indeterminate(): boolean {
        return this.checkable.indeterminate();
    }

    set indeterminate(value: boolean) {
        untracked(() => {
            const changed = value !== this.checkable.indeterminate();

            this.checkable.indeterminate.set(value);

            if (changed) {
                this.setTransitionCheckState();
                this.indeterminateChange.emit(value);
            }
        });
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

    /** @docs-private */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    /** Defines the behavior when a user clicks on the toggle. */
    // `KBQ_CHECKBOX_CLICK_ACTION` is the legacy fallback, kept for apps that already configure it globally
    // to control click behavior for both checkbox and toggle.
    clickAction: KbqToggleClickAction =
        inject(KBQ_CHECKABLE_CLICK_ACTION, { optional: true }) ??
        inject(KBQ_CHECKBOX_CLICK_ACTION, { optional: true }) ??
        undefined;

    protected readonly uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** @docs-private */
    readonly tabIndexInput = input<number | undefined, number | string | null | undefined>(undefined, {
        alias: 'tabIndex',
        transform: kbqOptionalNumberAttribute
    });

    /** @docs-private */
    readonly checkedInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'checked',
        transform: booleanAttribute
    });

    /** @docs-private */
    readonly indeterminateInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'indeterminate',
        transform: booleanAttribute
    });

    /** @docs-private */
    readonly clickActionInput = input<KbqToggleClickAction | undefined>(undefined, { alias: 'clickAction' });

    /** @docs-private */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did, except that `undefined` resets a member
        // typed without it to its default; unbound, it leaves what code wrote.
        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }

        if (changes['tabIndexInput']) this.tabIndex = this.tabIndexInput() ?? 0;

        if (changes['checkedInput']) {
            const checked = this.checkedInput();

            if (checked !== undefined) this.checked = checked;
        }

        if (changes['indeterminateInput']) {
            const indeterminate = this.indeterminateInput();

            if (indeterminate !== undefined) this.indeterminate = indeterminate;
        }

        if (changes['clickActionInput']) {
            this.clickAction = this.clickActionInput();
        }

        if (changes['idInput']) {
            this.id = this.idInput() ?? this.uniqueId;
        }
    }

    constructor() {
        super();

        this.id = this.uniqueId;

        // `writeValue` (ngModel/formControl) runs on `KbqCheckable`, bypassing the `checked`/`indeterminate`
        // setters, so this keeps the switch position in sync for form-driven value changes too.
        effect(() => this.setTransitionCheckState());
    }

    ngAfterViewInit(): void {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            // `FocusMonitor` emits the origin on focus and `null` on blur, so the control becomes touched when
            // focus leaves it, as a checkbox does: marking it on the way in shows a `required` error before any
            // interaction.
            .subscribe((origin) => !origin && this.checkable.onTouched());
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

    /**
     * Does nothing: the view reads nothing from the label, so a change of it needs no re-check.
     *
     * @deprecated Kept for back-compatibility. Will be removed in 22.0.0.
     */
    onLabelTextChange(): void {
        // Intentionally empty.
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
