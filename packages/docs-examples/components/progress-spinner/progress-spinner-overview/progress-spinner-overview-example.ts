import { Component, OnDestroy } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

/**
 * @title Basic progress spinner
 */
@Component({
    standalone: true,
    selector: 'progress-spinner-overview-example',
    imports: [
        KbqProgressSpinnerModule
    ],
    template: `
        <div class="layout-row">
            <div style="width: 40px">{{ percent }}%</div>
            <kbq-progress-spinner class="layout-margin-right-s" [value]="percent" />
        </div>
        <div class="layout-row">
            <div style="width: 40px">{{ percent }}%</div>
            <kbq-progress-spinner class="layout-margin-right-s" [size]="'big'" [value]="percent" />
        </div>
    `
})
export class ProgressSpinnerOverviewExample implements OnDestroy {
    themePalette = ThemePalette;

    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => (this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP)), INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
