import { afterNextRender, ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

const DELAY: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

/**
 * @title Basic progress spinner
 */
@Component({
    selector: 'progress-spinner-overview-example',
    imports: [KbqProgressSpinnerModule],
    template: `
        <small [style.width.px]="40">{{ percent() }}%</small>
        <kbq-progress-spinner [value]="percent()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ProgressSpinnerOverviewExample implements OnDestroy {
    readonly percent = signal(0);
    private intervalId: ReturnType<typeof setInterval>;

    constructor() {
        afterNextRender(() => {
            this.intervalId = setInterval(
                () => this.percent.update((value) => (value + STEP) % (MAX_PERCENT + STEP)),
                DELAY
            );
        });
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
