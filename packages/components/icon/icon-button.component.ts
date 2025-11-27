import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon } from './icon.component';

@Component({
    selector: `[kbq-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['icon-button.scss', 'icon-button-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq kbq-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-icon-button_small]': 'small'
    }
})
export class KbqIconButton extends KbqIcon implements AfterViewInit, OnDestroy {
    protected readonly focusMonitor = inject(FocusMonitor);

    @Input() small = false;

    /** Name of an icon within a @koobiq/icons. */
    @Input({ alias: 'kbq-icon-button' }) iconName: string;

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

    override name = 'KbqIconButton';

    ngAfterViewInit(): void {
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
