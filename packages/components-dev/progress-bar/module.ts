import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqProgressBarModule, ProgressBarMode } from '@koobiq/components/progress-bar';
import { ProgressBarExamplesModule } from 'packages/docs-examples/components/progress-bar';
import { interval } from 'rxjs';
import { DevThemeToggle } from '../theme-toggle';

const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    selector: 'dev-examples',
    imports: [ProgressBarExamplesModule],
    template: `
        <progress-bar-overview-example />
        <hr />
        <progress-bar-indeterminate-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqProgressBarModule, FormsModule, DevDocsExamples, DevThemeToggle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    mode: ProgressBarMode = 'determinate';
    readonly percent = signal(0);

    constructor() {
        interval(INTERVAL)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.percent.update((percent) => (percent + STEP) % (MAX_PERCENT + STEP)));
    }
}
