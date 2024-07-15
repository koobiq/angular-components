import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
    forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    KbqComponentColors,
    mixinColor,
    mixinDisabled,
    mixinTabIndex,
} from '@koobiq/components/core';

let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

/** @docs-private */
export class KbqToggleBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqToggleMixinBase: HasTabIndexCtor & CanDisableCtor & CanColorCtor & typeof KbqToggleBase = mixinTabIndex(
    mixinColor(mixinDisabled(KbqToggleBase), KbqComponentColors.Theme),
);

export class KbqToggleChange {
    source: KbqToggleComponent;
    checked: boolean;
}

@Component({
    selector: 'kbq-toggle',
    exportAs: 'kbqToggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color', 'tabIndex'],
    host: {
        class: 'kbq-toggle',
        '[class.kbq-toggle_big]': 'big',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-active]': 'checked',
    },
    animations: [
        trigger('switch', [
            state('true', style({ left: 'calc(100% - 11px)' })),
            state('false', style({ left: '3px' })),
            transition('true <=> false', animate('150ms')),
        ]),
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KbqToggleComponent),
            multi: true,
        },
    ],
})
export class KbqToggleComponent
    extends KbqToggleMixinBase
    implements ControlValueAccessor, CanColor, CanDisable, HasTabIndex
{
    @Input() big: boolean = false;

    @ViewChild('input', { static: false }) inputElement: ElementRef;

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
            this._changeDetectorRef.markForCheck();
        }
    }

    private _disabled: boolean = false;

    get checked() {
        return this._checked;
    }

    @Input()
    set checked(value: boolean) {
        if (value !== this._checked) {
            this._checked = value;
            this._changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    @Output() readonly change: EventEmitter<KbqToggleChange> = new EventEmitter<KbqToggleChange>();

    private uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    constructor(
        public elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        super(elementRef);

        this.id = this.uniqueId;

        this._focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this._focusMonitor.focusVia(this.inputElement.nativeElement, 'keyboard');
    }

    getAriaChecked(): boolean {
        return this.checked;
    }

    onChangeEvent(event: Event) {
        event.stopPropagation();

        this.updateModelValue();
        this.emitChangeEvent();
    }

    onLabelTextChange() {
        this._changeDetectorRef.markForCheck();
    }

    onInputClick(event: MouseEvent) {
        event.stopPropagation();
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

    // tslint:disable-next-line:no-empty
    private onTouchedCallback = () => {};

    // tslint:disable-next-line:no-empty
    private onChangeCallback = (_: any) => {};

    private updateModelValue() {
        this._checked = !this.checked;
        this.onTouchedCallback();
    }

    private emitChangeEvent() {
        const event = new KbqToggleChange();
        event.source = this;
        event.checked = this.checked;

        this.onChangeCallback(this.checked);
        this.change.emit(event);
    }
}
