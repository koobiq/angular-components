import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressBarModule, ProgressBarMode } from '@koobiq/components/progress-bar';
import { interval } from 'rxjs';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    standalone: true,
    imports: [KbqProgressBarModule, FormsModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    themePalette = ThemePalette;
    mode: ProgressBarMode = 'determinate';
    percent = signal<number>(0);

    constructor() {
        interval(INTERVAL)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.percent.update((percent: number) => (percent + STEP) % (MAX_PERCENT + STEP)));
    }
}
