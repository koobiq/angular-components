import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { ProgressBarMode } from './progress-bar.component';
import { KbqProgressBarModule } from './progress-bar.module';

type ProgressBarState = {
    mode: ProgressBarMode;
    value: number;
    /** Left unset on purpose in most cells: a falsy `[color]` has to fall back to the default colour. */
    color?: KbqComponentColors;
    text?: string;
    caption?: string;
    testid?: string;
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
                            <td style="width: 300px; height: 70px">
                                <kbq-progress-bar
                                    [attr.data-testid]="cell.testid"
                                    [color]="cell.color ?? ''"
                                    [value]="cell.value"
                                    [mode]="cell.mode"
                                >
                                    @if (cell.text) {
                                        <div kbq-progress-bar-text>{{ cell.text }}</div>
                                    }
                                    @if (cell.caption) {
                                        <div kbq-progress-bar-caption>{{ cell.caption }}</div>
                                    }
                                </kbq-progress-bar>
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
    protected readonly states = signal<ProgressBarState[][]>([
        [
            { mode: 'determinate', value: 0 },
            { mode: 'determinate', value: 50 },
            { mode: 'determinate', value: 100 }
        ],
        // The acceptance pair for the reduced-motion defect: an indeterminate bar must not look like a
        // finished one, and the whole Playwright suite runs with `reducedMotion: 'reduce'`.
        [
            { mode: 'indeterminate', value: 0, testid: 'e2eProgressBarIndeterminate' },
            { mode: 'determinate', value: 100, testid: 'e2eProgressBarComplete' }
        ],
        [
            { mode: 'determinate', value: 50, color: KbqComponentColors.Contrast },
            { mode: 'determinate', value: 50, color: KbqComponentColors.ContrastFade },
            { mode: 'determinate', value: 50, color: KbqComponentColors.Error }
        ],
        [
            {
                mode: 'determinate',
                value: 50,
                text: 'kbq-progress-bar-text',
                caption: 'kbq-progress-bar-caption'
            }
        ]
    ]);
}
