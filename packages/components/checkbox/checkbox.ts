import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    numberAttribute,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqCheckedState, KbqColorDirective } from '@koobiq/components/core';
import { KBQ_CHECKBOX_CLICK_ACTION, KbqCheckboxClickAction } from './checkbox-config';

// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 0;

/**
 * Provider Expression that allows kbq-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqCheckbox),
    multi: true
};

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
    exportAs: 'kbqCheckbox',
    templateUrl: 'checkbox.html',
    styleUrls: ['checkbox.scss', 'checkbox-tokens.scss'],
    host: {
        class: 'kbq-checkbox',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[attr.disabled]': 'disabled',
        '[class.kbq-checkbox_big]': 'big',
        '[class.kbq-indeterminate]': 'indeterminate',
        '[class.kbq-checked]': 'checked',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-checkbox_label-before]': 'labelPosition == "before"'
    },
    providers: [KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheckbox extends KbqColorDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {
    @Input() big: boolean = false;

    /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
    @Input() id: string;

    /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
    @Input() labelPosition: 'before' | 'after' = 'after';

    /** Name value will be applied to the input element if present */
    @Input() name: string | null = null;

    /** Event emitted when the checkbox's `checked` value changes. */
    @Output() readonly change: EventEmitter<KbqCheckboxChange> = new EventEmitter<KbqCheckboxChange>();

    /** Event emitted when the checkbox's `indeterminate` value changes. */
    @Output() readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** The value attribute of the native input element */
    @Input() value: string;

    /** The native `<input type="checkbox">` element */
    @ViewChild('input', { static: false }) inputElement: ElementRef;

    /** Returns the unique id for the visual hidden input. */
    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    /** Whether the checkbox is required. */
    @Input({ transform: booleanAttribute }) required: boolean | undefined;

    /**
     * Whether the checkbox is checked.
     */
    @Input()
    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        if (value !== this.checked) {
            this._checked = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    /** Whether the checkbox is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _disabled: boolean = false;

    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    /**
     * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    @Input()
    get indeterminate(): boolean {
        return this._indeterminate;
    }

    set indeterminate(value: boolean) {
        const changed = value !== this._indeterminate;
        this._indeterminate = value;

        if (changed) {
            if (this._indeterminate) {
                this.transitionCheckState(TransitionCheckState.Indeterminate);
            } else {
                this.transitionCheckState(this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
            }

            this.indeterminateChange.emit(this._indeterminate);
        }
    }

    private _indeterminate: boolean = false;

    private uniqueId: string = `kbq-checkbox-${++nextUniqueId}`;

    private currentAnimationClass: string = '';

    private currentCheckState: TransitionCheckState = TransitionCheckState.Init;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        @Optional() @Inject(KBQ_CHECKBOX_CLICK_ACTION) private clickAction: KbqCheckboxClickAction
    ) {
        super();

        this.id = this.uniqueId;
    }

    /**
     * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
     * @docs-private
     */
    onTouched: () => any = () => {};

    ngAfterViewInit() {
        this.focusMonitor
            .monitor(this.inputElement.nativeElement)
            .subscribe((focusOrigin) => this.onInputFocusChange(focusOrigin));
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.inputElement.nativeElement);
    }

    /** Method being called whenever the label text changes. */
    onLabelTextChange() {
        // This method is getting called whenever the label of the checkbox changes.
        // Since the checkbox uses the OnPush strategy we need to notify it about the change
        // that has been recognized by the cdkObserveContent directive.
        this.changeDetectorRef.markForCheck();
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any) {
        this.checked = !!value;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void) {
        this.controlValueAccessorChangeFn = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    getAriaChecked(): KbqCheckedState {
        return this.checked ? 'true' : this.indeterminate ? 'mixed' : 'false';
    }

    /** Toggles the `checked` state of the checkbox. */
    toggle(): void {
        this.checked = !this.checked;
    }

    /**
     * Event handler for checkbox input element.
     * Toggles checked state if element is not disabled.
     * Do not toggle on (change) event since IE doesn't fire change event when
     *   indeterminate checkbox is clicked.
     * @param event Input click event
     */
    onInputClick(event: Event) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `checkbox` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
        if (!this.disabled && this.clickAction !== 'noop') {
            // When user manually click on the checkbox, `indeterminate` is set to false.
            if (this.indeterminate && this.clickAction !== 'check') {
                Promise.resolve().then(() => {
                    this._indeterminate = false;
                    this.indeterminateChange.emit(this._indeterminate);
                });
            }

            this.toggle();
            this.transitionCheckState(this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this.emitChangeEvent();
        } else if (!this.disabled && this.clickAction === 'noop') {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `kbq-checkbox`.
            this.inputElement.nativeElement.checked = this.checked;
            this.inputElement.nativeElement.indeterminate = this.indeterminate;
        }
    }

    /** Focuses the checkbox. */
    focus(): void {
        this.focusMonitor.focusVia(this.inputElement.nativeElement, 'keyboard');
    }

    onInteractionEvent(event: Event) {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();
    }
    private controlValueAccessorChangeFn: (value: any) => void = () => {};

    private transitionCheckState(newState: TransitionCheckState) {
        const oldState = this.currentCheckState;
        const element: HTMLElement = this.elementRef.nativeElement;

        if (oldState === newState) {
            return;
        }

        if (this.currentAnimationClass.length > 0) {
            element.classList.remove(this.currentAnimationClass);
        }

        this.currentCheckState = newState;

        if (this.currentAnimationClass.length > 0) {
            element.classList.add(this.currentAnimationClass);
        }
    }

    private emitChangeEvent() {
        const event = new KbqCheckboxChange();
        event.source = this;
        event.checked = this.checked;

        this.controlValueAccessorChangeFn(this.checked);
        this.change.emit(event);
    }

    /** Function is called whenever the focus changes for the input element. */
    private onInputFocusChange(focusOrigin: FocusOrigin) {
        if (focusOrigin) {
            this.onTouched();
        }
    }
}
