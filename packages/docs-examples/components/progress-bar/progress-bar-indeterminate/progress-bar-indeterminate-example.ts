import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

/**
 * @title Progress bar indeterminate
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'progress-bar-indeterminate-example',
    styles: `
        .example-progress-bar {
            margin-bottom: var(--kbq-size-m);
        }
    `,
    imports: [
        KbqProgressBarModule
    ],
    template: `
        <kbq-progress-bar class="example-progress-bar" [mode]="'indeterminate'" />
    `
})
export class ProgressBarIndeterminateExample {}
