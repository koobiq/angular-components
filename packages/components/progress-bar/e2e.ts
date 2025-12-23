import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ProgressBarMode } from './progress-bar.component';
import { KbqProgressBarModule } from './progress-bar.module';

type ProgressBarState = {
    mode: ProgressBarMode;
    value: number;
};

@Component({
    selector: 'e2e-progress-bar-state-and-style',
    imports: [
        KbqProgressBarModule
    ],
    template: `
        <div>
            <table data-testid="e2eProgressBarTable">
                @for (row of states(); track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td style="width: 300px; height: 50px">
                                <kbq-progress-bar [value]="cell.value" [mode]="cell.mode" />
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eProgressBarStateAndStyle'
    }
})
export class E2eProgressBarStateAndStyle {
    constructor() {}

    protected readonly states = signal<ProgressBarState[][]>([
        [{ mode: 'determinate', value: 50 }],
        [{ mode: 'indeterminate', value: 0 }]
    ]);
}
