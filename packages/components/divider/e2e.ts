import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDivider } from './divider.component';

type DividerState = {
    vertical: boolean;
    paddings: boolean;
};

@Component({
    selector: 'e2e-divider-state-and-style',
    imports: [KbqDivider],
    template: `
        <div>
            <table data-testid="e2eDividerTable">
                @for (row of states; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-divider [vertical]="cell.vertical" [paddings]="cell.paddings" />
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    styles: `
        td {
            width: 50px;
            height: 50px;
            padding: 0;
            border: 1px solid hsla(216, 100%, 50%, 8%);
            border-radius: 8px;
            vertical-align: top;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eDividerStateAndStyle'
    }
})
export class E2eDividerStateAndStyle {
    protected readonly states: DividerState[][] = [
        [
            { vertical: false, paddings: false },
            { vertical: true, paddings: false },
            { vertical: false, paddings: true },
            { vertical: true, paddings: true }
        ]

    ];
}
