import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    Input,
    input,
    OnDestroy,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { KbqIcon } from './icon.component';

@Component({
    selector: `[kbq-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['icon-button.scss', 'icon-button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-icon-button_small]': 'small()'
    }
})
export class KbqIconButton extends KbqIcon implements AfterViewInit, OnDestroy {
    protected readonly focusMonitor = inject(FocusMonitor);

    readonly small = input(false);

    /** Name of an icon within a @koobiq/icons. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbq-icon-button' }) iconName: string;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this.disabledSignal.set(value);
    }

    // @todo 20 In the next major release this line will be deleted.
    private _disabled: boolean;

    /** @docs-private */
    readonly disabledSignal = signal(false);

    override name = 'KbqIconButton';

    constructor() {
        super();

        // @todo 20 In the next major release this line will be deleted.
        toObservable(this.disabledSignal).subscribe((value) => (this._disabled = value));

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
