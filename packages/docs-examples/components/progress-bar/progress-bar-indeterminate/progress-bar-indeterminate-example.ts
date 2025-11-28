import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

/**
 * @title Progress bar indeterminate
 */
@Component({
    selector: 'progress-bar-indeterminate-example',
    imports: [
        KbqProgressBarModule
    ],
    template: `
        <kbq-progress-bar class="example-progress-bar" [mode]="'indeterminate'" />
    `,
    styles: `
        .example-progress-bar {
            margin-bottom: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarIndeterminateExample {}
