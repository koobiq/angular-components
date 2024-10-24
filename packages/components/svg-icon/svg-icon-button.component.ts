import { FocusMonitor } from '@angular/cdk/a11y';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import { CanColor, KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '@koobiq/components/core';
import { KbqSvgIcon } from './svg-icon.component';

@Component({
    standalone: true,
    selector: `[kbq-svg-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['svg-icon-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq-svg-icon kbq-svg-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-svg-icon-button_small]': 'small'
    }
})
export class KbqSvgIconButton extends KbqSvgIcon implements OnDestroy, CanColor {
    @Input() small = false;

    @Input()
    get tabindex() {
        return this.disabled ? null : this._tabindex;
    }

    set tabindex(value: any) {
        this._tabindex = value;
    }

    private _tabindex = 0;

    /** Whether the button is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (this._disabled !== value) {
            this._disabled = value;

            this._disabled ? this.stopFocusMonitor() : this.runFocusMonitor();
        }
    }

    private _disabled: boolean;

    constructor(
        elementRef: ElementRef,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor
    ) {
        super(elementRef, formField, changeDetectorRef);

        this.runFocusMonitor();
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.getHostElement(), true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.getHostElement());
    }
}
