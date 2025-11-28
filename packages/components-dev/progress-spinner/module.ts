import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqProgressSpinnerModule, ProgressSpinnerMode } from '@koobiq/components/progress-spinner';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    selector: 'dev-app',
    imports: [KbqProgressSpinnerModule, FormsModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements OnDestroy {
    colors = KbqComponentColors;

    mode: ProgressSpinnerMode = 'determinate';
    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => (this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP)), INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
