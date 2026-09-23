import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    OnInit,
    output,
    Provider,
    QueryList,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqColorDirective } from '@koobiq/components/core';
import { KbqHint } from '@koobiq/components/form-field';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

/** Change event object emitted by KbqRadio. */
export class KbqRadioChange {
    constructor(
        /** The KbqRadioButton that emits the change event. */
        public source: KbqRadioButton,
        /** The value of the KbqRadioButton. */
        public value: any
    ) {}
}

/**
 * Provider Expression that allows kbq-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 * @docs-private
 */
export const KBQ_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqRadioGroup),
    multi: true
};

/**
 * Selection group for `KbqRadioButton`.
 *
 * `name`, `labelPosition` and `required` are `input()`s; the rest of the state lives in signals
 * behind accessor inputs, the split `KbqCheckbox` settled on in its own review. `value`, `selected`
 * and `disabled` stay accessors because they are written from outside the template — `writeValue`
 * and `setDisabledState` for the first and last, the buttons writing their selection back for
 * `selected`. `disabled` could not be a `model()` either, since a `model()` carries no `transform`
 * and it coerces with `booleanAttribute`; `value` could be one, but `writeValue` has to resolve the
 * checked button synchronously before the first render, and a `model()` would also publish a
 * `valueChange` output that duplicates `change`.
 *
 * The host is a `radiogroup`, which is not a name-from-content role, so it reaches assistive
 * technology unnamed unless the consumer names it. Name it with a plain `aria-label` /
 * `aria-labelledby` attribute pointing at the visible group label: the host is the very element the
 * consumer writes, so an input aliased to the same name would only write back what is already there —
 * and would wipe an `[attr.aria-label]` binding, which never reaches the input.
 */
@Directive({
    selector: 'kbq-radio-group',
    providers: [KBQ_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
    host: {
        role: 'radiogroup',
        class: 'kbq-radio-group',
        '[class.kbq-radio-group_normal]': '!big()',
        '[class.kbq-radio-group_big]': 'big()',
        '[attr.aria-required]': "required() ? 'true' : null",
        '[attr.aria-invalid]': "color === 'error' ? 'true' : null"
    },
    exportAs: 'kbqRadioGroup'
})
export class KbqRadioGroup extends KbqColorDirective implements AfterContentInit, ControlValueAccessor {
    private readonly changeDetector = inject(ChangeDetectorRef);

    readonly big = input<boolean>(false);

    /**
     * Name of the radio button group. All radio buttons inside this group will use this name,
     * unless they were given one of their own.
     */
    readonly name = input<string>(`kbq-radio-group-${nextUniqueId++}`);

    /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
    readonly labelPosition = input<'before' | 'after', 'before' | 'after'>('after', {
        transform: (value) => (value === 'before' ? 'before' : 'after')
    });

    /** Value of the radio button. */
    @Input()
    get value(): any {
        return this._value();
    }

    set value(newValue: any) {
        if (this._value() !== newValue) {
            // Set this before proceeding to ensure no circular loop occurs with selection.
            this._value.set(newValue);

            this.updateSelectedRadioFromValue();
            this.checkSelectedRadioButton();
        }
    }

    /** Whether the radio button is selected. */
    @Input()
    get selected() {
        return this._selected();
    }

    set selected(selected: KbqRadioButton | null) {
        this._selected.set(selected);
        this.value = selected ? selected.value : null;
        this.checkSelectedRadioButton();
    }

    /** Whether the radio group is disabled */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled();
    }

    set disabled(value: boolean) {
        this._disabled.set(value);
        this.markRadiosForCheck();
    }

    private readonly _disabled = signal(false);

    /** Whether the radio group is required */
    readonly required = input(false, { transform: booleanAttribute });

    /**
     * Event emitted when the group value changes.
     * Change events are only emitted when the value changes due to user interaction with
     * a radio button (the same behavior as `<input type-"radio">`).
     */
    readonly change = output<KbqRadioChange>();

    /** Child radio buttons. */
    @ContentChildren(forwardRef(() => KbqRadioButton), { descendants: true })
    radios: QueryList<KbqRadioButton>;

    /**
     * Selected value for group. Should equal the value of the selected radio button if there *is*
     * a corresponding radio button with a matching value. If there is *not* such a corresponding
     * radio button, this value persists to be applied in case a new radio button is added with a
     * matching value.
     */
    private readonly _value = signal<any>(null);

    /** The currently selected radio button. Should match value. */
    private readonly _selected = signal<KbqRadioButton | null>(null);

    /** Whether the `value` has been set to its initial value. */
    private isInitialized: boolean = false;

    /** The method to be called in order to update ngModel */
    controlValueAccessorChangeFn: (value: any) => void = () => {};

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @docs-private
     */
    onTouched: () => any = () => {};

    checkSelectedRadioButton() {
        const selected = this._selected();

        if (selected && !selected.checked) {
            selected.checked = true;
        }
    }

    /**
     * Initialize properties once content children are available.
     * This allows us to propagate relevant attributes to associated buttons.
     */
    ngAfterContentInit() {
        // Mark this component as initialized in AfterContentInit because the initial value can
        // possibly be set by NgModel on KbqRadioGroup, and it is possible that the OnInit of the
        // NgModel occurs *after* the OnInit of the KbqRadioGroup.
        this.isInitialized = true;
    }

    /**
     * Moves focus to the checked radio button, or to the first enabled one when nothing is checked —
     * the same rule the browser follows when the group is reached with <kbd>Tab</kbd>.
     */
    focus(origin: FocusOrigin = 'program'): void {
        const target = this._selected() ?? this.radios?.find((radio) => !radio.disabled);

        target?.focus(origin);
    }

    /**
     * Mark this group as being "touched" (for ngModel). Meant to be called by the contained
     * radio buttons upon their blur.
     */
    touch() {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    /** Dispatch change event with current selection and group value. */
    emitChangeEvent(): void {
        if (this.isInitialized) {
            this.change.emit(new KbqRadioChange(this._selected()!, this._value()));
        }
    }

    markRadiosForCheck() {
        if (this.radios) {
            this.radios.forEach((radio) => radio.markForCheck());
        }
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     */
    writeValue(value: any) {
        this.value = value;
        this.changeDetector.markForCheck();
    }

    /**
     * Registers a callback to be triggered when the model value changes.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnChange(fn: (value: any) => void) {
        this.controlValueAccessorChangeFn = fn;
    }

    /**
     * Registers a callback to be triggered when the control is touched.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     * @param isDisabled Whether the control should be disabled.
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
        this.changeDetector.markForCheck();
    }

    /** Updates the `selected` radio button from the internal _value state. */
    private updateSelectedRadioFromValue(): void {
        // If the value already matches the selected radio, do nothing.
        const selected = this._selected();
        const isAlreadySelected = selected !== null && selected.value === this._value();

        if (this.radios != null && !isAlreadySelected) {
            this._selected.set(null);

            this.radios.forEach((radio) => {
                radio.checked = this.value === radio.value;

                if (radio.checked) {
                    this._selected.set(radio);
                }
            });
        }
    }
}

@Component({
    selector: 'kbq-radio-button',
    templateUrl: 'radio.component.html',
    styleUrls: ['radio.scss', 'radio-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-radio-button',
        '[attr.id]': 'id()',
        '[class.kbq-radio-button_big]': 'radioGroup?.big()',
        '[class.kbq-selected]': 'checked',
        '[class.kbq-disabled]': 'disabled'
    },
    exportAs: 'kbqRadioButton'
})
export class KbqRadioButton extends KbqColorDirective implements OnInit, AfterViewInit, OnDestroy {
    private readonly changeDetector = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly radioDispatcher = inject(UniqueSelectionDispatcher);

    /** Whether this radio button is checked. */
    @Input({ transform: booleanAttribute })
    get checked(): boolean {
        return this._checked();
    }

    set checked(value: boolean) {
        if (this._checked() !== value) {
            this._checked.set(value);

            if (value && this.radioGroup && this.radioGroup.value !== this.value) {
                this.radioGroup.selected = this;
            } else if (!value && this.radioGroup && this.radioGroup.value === this.value) {
                // When unchecking the selected radio button, update the selected radio
                // property on the group.
                this.radioGroup.selected = null;
            }

            if (value) {
                // Notify all radio buttons with the same name to un-check.
                this.radioDispatcher.notify(this.id(), this.name);
            }

            this.changeDetector.markForCheck();
        }
    }

    /** The value of this radio button. */
    @Input()
    get value(): any {
        return this._value();
    }

    set value(value: any) {
        if (this._value() !== value) {
            this._value.set(value);

            if (this.radioGroup) {
                if (!this.checked) {
                    // Update checked when the value changed to match the radio group's value
                    this.checked = this.radioGroup.value === value;
                }

                if (this.checked) {
                    this.radioGroup.selected = this;
                }
            }
        }
    }

    /** Whether the radio button is disabled. A button inside a disabled group is disabled as well. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled() || !!this.radioGroup?.disabled;
    }

    set disabled(value: boolean) {
        if (this._disabled() !== value) {
            this._disabled.set(value);
            this.changeDetector.markForCheck();
        }
    }

    private readonly _disabled = signal(false);

    /** Tabindex of the native input. A disabled button is taken out of the tab order. */
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex();
    }

    set tabIndex(value: number) {
        this._tabIndex.set(value);
    }

    private readonly _tabIndex = signal(0);

    /** Whether the radio button is required. A button inside a required group is required as well. */
    @Input({ transform: booleanAttribute })
    get required(): boolean {
        return this._required() || !!this.radioGroup?.required();
    }

    set required(value: boolean) {
        this._required.set(value);
    }

    /** Whether this radio is required. */
    private readonly _required = signal(false);

    /** Whether the label should appear after or before the radio button. Defaults to 'after' */
    @Input()
    get labelPosition(): 'before' | 'after' {
        return this._labelPosition() || this.radioGroup?.labelPosition() || 'after';
    }
    /** @docs-private */
    set labelPosition(value) {
        this._labelPosition.set(value);
    }

    /**
     * Analog to HTML 'name' attribute used to group radios for unique selection. Defaults to the
     * parent group's name, or — outside a group — to an id unique to this button.
     */
    // An accessor rather than a plain field: the app-global UniqueSelectionDispatcher isolates its
    // listeners by name alone, so a button that resolved to `undefined` would share one selection
    // group with every other unnamed radio button in the application. Resolving the group's name here
    // rather than copying it in `ngOnInit` is also what keeps an explicitly bound `[name]` alive.
    @Input()
    get name(): string {
        return this._name() ?? this.radioGroup?.name() ?? this.uniqueId;
    }

    set name(value: string) {
        this._name.set(value);
    }

    /** The native `<input type=radio>` element */
    readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('input');

    /**
     * Event emitted when the checked state of this radio button changes.
     * Change events are only emitted when the value changes due to user interaction with
     * the radio button (the same behavior as `<input type-"radio">`).
     */

    readonly change = output<KbqRadioChange>();

    /** The parent radio group. `null` when the button is used outside one. */
    radioGroup: KbqRadioGroup | null = inject(KbqRadioGroup, { optional: true });

    private readonly uniqueId: string = `kbq-radio-${++nextUniqueId}`;

    /**
     * A unique id for the radio button. If none is supplied — or `null` is bound explicitly — it is
     * auto-generated, so a read always yields the id the element actually carries.
     */
    readonly id = input(this.uniqueId, {
        transform: (value: string | null | undefined) => value || this.uniqueId
    });

    /** ID of the native input element inside `<kbq-radio-button>` */
    readonly inputId = computed(() => `${this.id()}-input`);

    /**
     * ID of the element holding the option text. The native input points its `aria-labelledby` at it,
     * so the accessible name is the option text alone rather than everything the wrapping `<label>`
     * contains — the projected hint included.
     */
    protected readonly labelId = computed(() => `${this.id()}-label`);

    /**
     * The `value` attribute of the native input. An `<input type="radio">` with no `value` submits the
     * literal string `"on"`, so only string-like values round-trip through native form submission.
     */
    protected get nativeValue(): string | null {
        const value = this._value();

        return value == null ? null : String(value);
    }

    /** Hint projected into the button, referenced by the native input's `aria-describedby`. */
    protected readonly hint = contentChild(KbqHint);

    private readonly _labelPosition = signal<'before' | 'after' | undefined>(undefined);

    private readonly _name = signal<string | undefined>(undefined);

    /** Whether this radio is checked. */
    private readonly _checked = signal(false);

    /** Value assigned to this radio. */
    private readonly _value = signal<any>(null);

    constructor() {
        super();

        this.removeUniqueSelectionListener = this.radioDispatcher.listen((id: string, name: string) => {
            if (id !== this.id() && name === this.name) {
                this.checked = false;
            }
        });
    }

    ngOnInit() {
        if (this.radioGroup) {
            // If the radio is inside a radio group, determine if it should be checked
            this.checked = this.radioGroup.value === this._value();
        }
    }

    ngAfterViewInit() {
        this.focusMonitor.monitor(this.elementRef, true).subscribe((focusOrigin) => {
            if (!focusOrigin && this.radioGroup) {
                this.radioGroup.touch();
            }
        });
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.removeUniqueSelectionListener();
    }

    /**
     * Focuses the radio button.
     *
     * Routed through the `FocusMonitor` so the origin is recorded: the focus ring is keyed off
     * `.cdk-keyboard-focused`, which a bare `element.focus()` never produces.
     */
    focus(origin: FocusOrigin = 'program'): void {
        this.focusMonitor.focusVia(this.inputElement(), origin);
    }

    /**
     * Marks the radio button as needing checking for change detection.
     * This method is exposed because the parent radio group will directly
     * update bound properties of the radio button.
     */
    markForCheck() {
        // When group value changes, the button will not be notified. Use `markForCheck` to explicit
        // update radio button's status
        this.changeDetector.markForCheck();
    }

    onInputClick(event: Event) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `radio-button` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling & forcing skip event from closing actions for the second event will solve that issue.
        event.stopPropagation();
        (event as Event & { kbqPopoverPreventHide: boolean }).kbqPopoverPreventHide = true;
    }

    onInputChange(event: Event) {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();

        const groupValueChanged = this.radioGroup && this.value !== this.radioGroup.value;

        this.checked = true;
        this.emitChangeEvent();

        if (this.radioGroup) {
            this.radioGroup.controlValueAccessorChangeFn(this.value);
            this.radioGroup.touch();

            if (groupValueChanged) {
                this.radioGroup.emitChangeEvent();
            }
        }
    }

    /** Unregister function for _radioDispatcher */
    private readonly removeUniqueSelectionListener: () => void = () => {};

    /** Dispatch change event with current value. */
    private emitChangeEvent(): void {
        this.change.emit(new KbqRadioChange(this, this._value()));
    }
}
