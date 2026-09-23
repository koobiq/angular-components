import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDivider } from './divider.component';

type DividerState = {
    vertical: boolean;
    paddings: boolean;
};

@Component({
    selector: 'e2e-divider-state-and-style',
    imports: [KbqDivider, KbqButtonModule],
    template: `
        <div>
            <table data-testid="e2eDividerTable">
                @for (row of states; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <div class="e2e-divider-cell" [style.flex-direction]="cell.vertical ? 'row' : 'column'">
                                    <span class="e2e-divider-sibling"></span>
                                    <kbq-divider [vertical]="cell.vertical" [paddings]="cell.paddings" />
                                    <span class="e2e-divider-sibling"></span>
                                </div>
                            </td>
                        }
                    </tr>
                }
                <tr>
                    <td colspan="4">
                        <!-- A toolbar row is where vertical dividers are actually used: the row has no
                             definite height, so a divider sized with a percentage collapses here. -->
                        <div class="e2e-divider-toolbar" data-testid="e2eDividerToolbar">
                            <button kbq-button>Left</button>
                            <kbq-divider [vertical]="true" />
                            <button kbq-button>Right</button>
                        </div>
                    </td>
                </tr>
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

        .e2e-divider-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 50px;
        }

        .e2e-divider-sibling {
            flex: none;
            width: 16px;
            height: 16px;
            background: hsla(216, 100%, 50%, 8%);
        }

        .e2e-divider-toolbar {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 4px;
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
