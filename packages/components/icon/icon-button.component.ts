import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Attribute,
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
import { CanColor, KBQ_FORM_FIELD_REF, KbqFormFieldRef, toBoolean } from '@koobiq/components/core';
import { KbqIcon } from './icon.component';

@Component({
    selector: `[kbq-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['icon-button.scss', 'icon-button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'mc kbq-icon kbq-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-icon-button_small]': 'small'
    }
})
export class KbqIconButton extends KbqIcon implements OnDestroy, CanColor {
    @Input() small = false;

    @Input()
    get tabindex() {
        return this.disabled ? null : this._tabindex;
    }

    set tabindex(value: any) {
        this._tabindex = value;
    }

    private _tabindex = 0;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        const newDisabledState = toBoolean(value);

        if (this._disabled !== newDisabledState) {
            this._disabled = newDisabledState;

            this._disabled ? this.stopFocusMonitor() : this.runFocusMonitor();
        }
    }

    private _disabled: boolean;

    override name = 'KbqIconButton';

    constructor(
        elementRef: ElementRef,
        @Attribute('kbq-icon-button') iconName: string,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor
    ) {
        super(elementRef, iconName, formField, changeDetectorRef);

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
