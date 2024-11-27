import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getNodesWithoutComments, KbqButton } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';

/** Acceptable types for a button toggle. */
export type ToggleType = 'checkbox' | 'radio';

/**
 * Provider Expression that allows kbq-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqButtonToggleGroup),
    multi: true
};

/** Change event object emitted by MсButtonToggle. */
export class KbqButtonToggleChange {
    constructor(
        /** The MсButtonToggle that emits the event. */
        public source: KbqButtonToggle,
        /** The value assigned to the MсButtonToggle. */
        public value: any
    ) {}
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
    selector: 'kbq-button-toggle-group',
    providers: [KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
    host: {
        class: 'kbq-button-toggle-group',
        '[class.kbq-button-toggle_vertical]': 'vertical'
    },
    exportAs: 'kbqButtonToggleGroup'
})
export class KbqButtonToggleGroup implements ControlValueAccessor, OnInit, AfterContentInit {
    /** Whether the toggle group is vertical. */
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = coerceBooleanProperty(value);
    }

    /** Value of the toggle group. */
    @Input()
    get value(): any {
        const selected = this.selectionModel ? this.selectionModel.selected : [];

        if (this.multiple) {
            return selected.map((toggle) => toggle.value);
        }

        return selected[0] ? selected[0].value : undefined;
    }

    set value(newValue: any) {
        this.setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }

    /** Selected button toggles in the group. */
    get selected(): any {
        const selected = this.selectionModel.selected;

        return this.multiple ? selected : selected[0] || null;
    }

    /** Whether multiple button toggles can be selected. */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        this._multiple = coerceBooleanProperty(value);
    }

    /** Child button toggle buttons. */
    @ContentChildren(forwardRef(() => KbqButtonToggle)) buttonToggles: QueryList<KbqButtonToggle>;

    /** Whether multiple button toggle group is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        if (!this.buttonToggles) {
            return;
        }

        this.buttonToggles.forEach((toggle) => toggle.markForCheck());
    }

    /**
     * Event that emits whenever the value of the group changes.
     * Used to facilitate two-way data binding.
     * @docs-private
     */
    @Output() readonly valueChange = new EventEmitter<any>();

    /** Event emitted when the group's value changes. */
    @Output() readonly change: EventEmitter<KbqButtonToggleChange> = new EventEmitter<KbqButtonToggleChange>();
    private _vertical = false;
    private _multiple = false;
    private _disabled = false;
    private selectionModel: SelectionModel<KbqButtonToggle>;

    /**
     * Reference to the raw value that the consumer tried to assign. The real
     * value will exclude any values from this one that don't correspond to a
     * toggle. Useful for the cases where the value is assigned before the toggles
     * have been initialized or at the same that they're being swapped out.
     */
    private rawValue: any;

    constructor(private _changeDetector: ChangeDetectorRef) {}

    /**
     * The method to be called in order to update ngModel.
     * Now `ngModel` binding is not supported in multiple selection mode.
     */
    controlValueAccessorChangeFn: (value: any) => void = () => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
    onTouched: () => any = () => {};

    ngOnInit() {
        this.selectionModel = new SelectionModel<KbqButtonToggle>(this.multiple, undefined, false);
    }

    ngAfterContentInit() {
        this.selectionModel.select(...this.buttonToggles.filter((toggle) => toggle.checked));
        this.disabled = this._disabled;
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value: any) {
        this.value = value;
        this._changeDetector.markForCheck();
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
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** Dispatch change event with current selection and group value. */
    emitChangeEvent(): void {
        const selected = this.selected;
        const source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
        const event = new KbqButtonToggleChange(source, this.value);
        this.controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }

    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     */
    syncButtonToggle(toggle: KbqButtonToggle, select: boolean, isUserInput = false) {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            (this.selected as KbqButtonToggle).checked = false;
        }

        if (select) {
            this.selectionModel.select(toggle);
        } else {
            this.selectionModel.deselect(toggle);
        }

        // Only emit the change event for user input.
        if (isUserInput) {
            this.emitChangeEvent();
        }

        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }

    /** Checks whether a button toggle is selected. */
    isSelected(toggle: KbqButtonToggle) {
        return this.selectionModel.isSelected(toggle);
    }

    /** Determines whether a button toggle should be checked on init. */
    isPrechecked(toggle: KbqButtonToggle) {
        if (this.rawValue === undefined) {
            return false;
        }

        if (this.multiple && Array.isArray(this.rawValue)) {
            return this.rawValue.some((value) => toggle.value != null && value === toggle.value);
        }

        return toggle.value === this.rawValue;
    }

    /** Updates the selection state of the toggles in the group based on a value. */
    private setSelectionByValue(value: any | any[]) {
        this.rawValue = value;

        if (!this.buttonToggles) {
            return;
        }

        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }

            this.clearSelection();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
        } else {
            this.clearSelection();
            this.selectValue(value);
        }
    }

    /** Clears the selected toggles. */
    private clearSelection() {
        this.selectionModel.clear();
        this.buttonToggles.forEach((toggle) => (toggle.checked = false));
    }

    /** Selects a value if there's a toggle that corresponds to it. */
    private selectValue(value: any) {
        const correspondingOption = this.buttonToggles.find((toggle) => {
            return toggle.value != null && toggle.value === value;
        });

        if (correspondingOption) {
            correspondingOption.checked = true;
            this.selectionModel.select(correspondingOption);
        }
    }
}

/** Single button inside of a toggle group. */
@Component({
    selector: 'kbq-button-toggle',
    exportAs: 'kbqButtonToggle',
    template: `
        <button
            [kbqStyle]="'transparent'"
            [class.kbq-selected]="checked"
            [disabled]="disabled"
            [tabIndex]="tabIndex || 0"
            (click)="onToggleClick()"
            kbq-button
            kbq-title
            type="button"
        >
            <div class="kbq-button-toggle-wrapper" #kbqTitleText>
                <ng-content />
            </div>
        </button>
    `,
    styleUrls: ['button-toggle.scss', 'button-toggle-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-button-toggle',
        '[class]': '"kbq-button-toggle" + iconType'
    }
})
export class KbqButtonToggle implements OnInit, AfterContentInit, OnDestroy {
    @ContentChildren(KbqIcon, { descendants: true }) icons: QueryList<KbqIcon>;

    /** Whether the button is checked. */
    @Input()
    get checked(): boolean {
        return this.buttonToggleGroup ? this.buttonToggleGroup.isSelected(this) : this._checked;
    }

    set checked(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._checked) {
            this._checked = newValue;

            if (this.buttonToggleGroup) {
                this.buttonToggleGroup.syncButtonToggle(this, this._checked);
            }

            this.changeDetectorRef.markForCheck();
        }
    }

    type: ToggleType;
    iconType: string = '';

    @ViewChild(KbqButton, { static: false }) mcButton: KbqButton;

    /** KbqButtonToggleGroup reads this to assign its own value. */
    @Input() value: any;

    /** Tabindex for the toggle. */
    @Input() tabIndex: number | null;

    @Input()
    get disabled(): boolean {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Event emitted when the group value changes. */
    @Output() readonly change: EventEmitter<KbqButtonToggleChange> = new EventEmitter<KbqButtonToggleChange>();

    private isSingleSelector = false;
    private _checked = false;
    private _disabled: boolean = false;

    constructor(
        @Optional() public buttonToggleGroup: KbqButtonToggleGroup,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private element: ElementRef
    ) {}

    ngOnInit() {
        this.isSingleSelector = this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
        this.type = this.isSingleSelector ? 'radio' : 'checkbox';

        if (this.buttonToggleGroup && this.buttonToggleGroup.isPrechecked(this)) {
            this.checked = true;
        }

        this.focusMonitor.monitor(this.element.nativeElement, true);
    }

    ngAfterContentInit(): void {
        if (this.icons.length) {
            const nodesWithoutComments = getNodesWithoutComments(
                this.element.nativeElement.querySelector('.kbq-button-toggle-wrapper')!.childNodes as NodeList
            ).length;
            this.iconType = nodesWithoutComments === this.icons.length ? '-icon' : '-icon-text';
        }
    }

    ngOnDestroy() {
        const group = this.buttonToggleGroup;

        this.focusMonitor.stopMonitoring(this.element.nativeElement);

        // Remove the toggle from the selection once it's destroyed. Needs to happen
        // on the next tick in order to avoid "changed after checked" errors.
        if (group && group.isSelected(this)) {
            Promise.resolve().then(() => group.syncButtonToggle(this, false));
        }
    }

    /** Focuses the button. */
    focus(): void {
        this.element.nativeElement.focus();
    }

    /** Checks the button toggle due to an interaction with the underlying native button. */
    onToggleClick() {
        if (this.disabled) {
            return;
        }

        const newChecked = this.isSingleSelector ? true : !this._checked;

        if (newChecked !== this._checked) {
            this._checked = newChecked;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup.syncButtonToggle(this, this._checked, true);
                this.buttonToggleGroup.onTouched();
            }
        }
        // Emit a change event when it's the single selector
        this.change.emit(new KbqButtonToggleChange(this, this.value));
    }

    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     */
    markForCheck() {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this.changeDetectorRef.markForCheck();
    }
}
