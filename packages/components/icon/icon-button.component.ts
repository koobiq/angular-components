import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    Input,
    OnDestroy,
    signal,
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

    // @todo 20 In the next major release this feature will be replaced on the input signal.
    /** Whether the button is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.disabledSignal();
    }

    set disabled(value: boolean) {
        if (this.disabledSignal() !== value) {
            this.disabledSignal.set(value);
        }
    }

    /** @docs-private */
    disabledSignal = signal(false);

    override name = 'KbqIconButton';

    constructor() {
        super();

        effect(() => (this.disabledSignal() ? this.stopFocusMonitor() : this.runFocusMonitor()));
    }

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
