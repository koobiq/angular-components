import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    effect,
    ElementRef,
    inject,
    input,
    numberAttribute,
    OnChanges,
    OnDestroy,
    output,
    SimpleChanges,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { KBQ_CHECKBOX_CLICK_ACTION } from '@koobiq/components/checkbox';
import {
    KBQ_CHECKABLE_CLICK_ACTION,
    kbqAnimationsDisabled,
    KbqCheckable,
    KbqCheckableClickAction,
    KbqCheckedState,
    KbqColorDirective,
    TransitionCheckState
} from '@koobiq/components/core';

let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

export class KbqToggleChange {
    source: KbqToggleComponent;
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
    providers: [
        // Falls back to `KBQ_CHECKBOX_CLICK_ACTION` for backwards compatibility with apps that already
        // configure it globally to control click behavior for both checkbox and toggle.
        { provide: KBQ_CHECKABLE_CLICK_ACTION, useFactory: () => inject(KBQ_CHECKBOX_CLICK_ACTION, { optional: true }) }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toggle',
        '[class.kbq-toggle_big]': 'big()',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.kbq-disabled]': 'disabled || loading()',
        '[class.kbq-active]': 'checked',
        '[class.kbq-indeterminate]': 'indeterminate'
    },
    hostDirectives: [KbqCheckable],
    exportAs: 'kbqToggle'
})
export class KbqToggleComponent
    extends KbqColorDirective
    implements OnChanges, AfterViewInit, ControlValueAccessor, OnDestroy
{
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly checkable = inject(KbqCheckable, { self: true });

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

    readonly value = input<string>(undefined!);

    get disabled() {
        return this.checkable.disabled();
    }

    set disabled(value: any) {
        this.checkable.disabled.set(value);
    }

    get tabIndex(): number {
        return this.checkable.effectiveTabIndex();
    }

    set tabIndex(value: number) {
        this.checkable.tabIndex.set(value);
    }

    get checked() {
        return this.checkable.checked();
    }

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
    protected currentCheckState: TransitionCheckState = TransitionCheckState.Init;

    /** @docs-private */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    /** Defines the behavior when a user clicks on the toggle. */
    clickAction: KbqToggleClickAction = inject(KBQ_CHECKABLE_CLICK_ACTION, { optional: true }) || undefined;

    private uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** @docs-private */
    readonly tabIndexInput = input<number | undefined, number | string | null | undefined>(undefined, {
        alias: 'tabIndex',
        transform: numberAttribute
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
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }

        if (changes['tabIndexInput']) {
            const tabIndex = this.tabIndexInput();

            if (tabIndex !== undefined) this.tabIndex = tabIndex;
        }

        if (changes['checkedInput']) {
            const checked = this.checkedInput();

            if (checked !== undefined) this.checked = checked;
        }

        if (changes['indeterminateInput']) {
            const indeterminate = this.indeterminateInput();

            if (indeterminate !== undefined) this.indeterminate = indeterminate;
        }

        if (changes['clickActionInput']) {
            const clickAction = this.clickActionInput();

            if (clickAction !== undefined) this.clickAction = clickAction;
        }

        if (changes['idInput']) {
            const id = this.idInput();

            if (id !== undefined) this.id = id;
        }
    }

    constructor() {
        super();

        this.id = this.uniqueId;

        // `writeValue` (ngModel/formControl) now runs on `KbqCheckable`, bypassing the `checked`/`indeterminate`
        // setters below, so this keeps the switch position in sync for form-driven value changes too.
        effect(() => this.setTransitionCheckState());
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
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
        if (this.loading()) return;
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `toggle` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        const { shouldToggle, shouldClearIndeterminate } = this.checkable.resolveClick(this.clickAction);

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
            this.transitionCheckState(this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
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

    private setTransitionCheckState() {
        if (this.indeterminate) {
            this.transitionCheckState(TransitionCheckState.Indeterminate);
        } else {
            this.transitionCheckState(this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
        }
    }

    private transitionCheckState(newState: TransitionCheckState) {
        if (this.currentCheckState === newState) return;

        this.currentCheckState = newState;
    }

    private emitChangeEvent() {
        // Note: `toggle()` already notifies the ControlValueAccessor change handler via `KbqCheckable.toggle()`.
        const event = new KbqToggleChange();

        event.source = this;
        event.checked = this.checked;

        this.change.emit(event);
    }
}
