import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressBarModule, ProgressBarMode } from '@koobiq/components/progress-bar';
import { ProgressBarExamplesModule } from 'packages/docs-examples/components/progress-bar';
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements OnDestroy {
    themePalette = ThemePalette;
    mode: ProgressBarMode = 'determinate';
    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => (this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP)), INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
