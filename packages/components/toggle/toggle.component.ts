import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KBQ_CHECKBOX_CLICK_ACTION, TransitionCheckState } from '@koobiq/components/checkbox';
import { KbqAnimationCurves, KbqAnimationDurations, KbqCheckedState, KbqColorDirective } from '@koobiq/components/core';

let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

export class KbqToggleChange {
    source: KbqToggleComponent;
    checked: boolean;
}

@Component({
    selector: 'kbq-toggle',
    imports: [
        CdkObserveContent
    ],
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.scss', './toggle-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqToggle',
    host: {
        class: 'kbq-toggle',
        '[class.kbq-toggle_big]': 'big',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.kbq-disabled]': 'disabled || loading',
        '[class.kbq-active]': 'checked',
        '[class.kbq-indeterminate]': 'indeterminate'
    },
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
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KbqToggleComponent),
            multi: true
        }
    ]
})
export class KbqToggleComponent extends KbqColorDirective implements AfterViewInit, ControlValueAccessor, OnDestroy {
    @Input() big: boolean = false;

    @ViewChild('input', { static: false }) inputElement: ElementRef<HTMLInputElement>;

    @Input() labelPosition: ToggleLabelPositionType = 'right';

    @Input('aria-label') ariaLabel: string = '';
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    @Input() id: string;

    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    @Input() name: string | null = null;

    @Input() value: string;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value !== this._disabled) {
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

    get checked() {
        return this._checked;
    }

    @Input()
    set checked(value: boolean) {
        if (value !== this._checked) {
            this._checked = value;
            this.setTransitionCheckState();
            this.changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    /**
     * Whether the toggle is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    @Input({ transform: booleanAttribute })
    get indeterminate(): boolean {
        return this._indeterminate;
    }

    set indeterminate(value: boolean) {
        const changed = value !== this._indeterminate;

        this._indeterminate = value;

        if (changed) {
            this.setTransitionCheckState();
            this.indeterminateChange.emit(this._indeterminate);
        }
    }

    private _indeterminate: boolean = false;
    /**
     * Property for manually set loading state.
     */
    @Input({ transform: booleanAttribute }) loading: boolean = false;

    @Output() readonly change: EventEmitter<KbqToggleChange> = new EventEmitter<KbqToggleChange>();

    /** Event emitted when the toggle's `indeterminate` value changes. */
    @Output() readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** @docs-private */
    protected currentCheckState: TransitionCheckState = TransitionCheckState.Init;

    protected clickAction = inject(KBQ_CHECKBOX_CLICK_ACTION, { optional: true });

    private uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    constructor(
        private focusMonitor: FocusMonitor,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();

        this.id = this.uniqueId;
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.focusMonitor.focusVia(this.inputElement.nativeElement, 'keyboard');
    }

    getAriaChecked(): KbqCheckedState {
        return this.checked ? 'true' : this.indeterminate ? 'mixed' : 'false';
    }

    onChangeEvent(event: Event) {
        event.stopPropagation();
    }

    onLabelTextChange() {
        this.changeDetectorRef.markForCheck();
    }

    onInputClick(event: MouseEvent) {
        if (this.loading) return;
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `toggle` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        if (!this.disabled && this.clickAction !== 'noop') {
            // When user manually click on the toggle, `indeterminate` is set to false.
            if (this.indeterminate && this.clickAction !== 'check') {
                Promise.resolve().then(() => {
                    this._indeterminate = false;
                    this.indeterminateChange.emit(this._indeterminate);
                });
            }

            this._checked = !this.checked;
            this.onTouchedCallback();
            this.transitionCheckState(this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this.emitChangeEvent();
        } else if (!this.disabled && this.clickAction === 'noop') {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `kbq-toggle`.
            this.inputElement.nativeElement.checked = this.checked;
            this.inputElement.nativeElement.indeterminate = this.indeterminate;
        }
    }

    writeValue(value: any) {
        this.checked = !!value;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

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

    private onTouchedCallback = () => {};

    private onChangeCallback = (_: any) => {};

    private transitionCheckState(newState: TransitionCheckState) {
        const oldState = this.currentCheckState;

        if (oldState === newState) return;

        this.currentCheckState = newState;
    }

    private emitChangeEvent() {
        const event = new KbqToggleChange();

        event.source = this;
        event.checked = this.checked;

        this.onChangeCallback(this.checked);
        this.change.emit(event);
    }
}
