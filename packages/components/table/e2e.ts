import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    selector: 'e2e-table-states',
    imports: [KbqTableModule],
    template: `
        <!-- first row hovered -->
        <div>
            <table kbq-table>
                <thead>
                    <tr>
                        @for (th of [0, 1, 2, 3]; track $index) {
                            <th>Header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1, 2]; track $index) {
                        <tr [class.kbq-hovered]="$first">
                            @for (td of [0, 1, 2, 3]; track $index) {
                                <td>Cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- middle row hovered -->
        <div>
            <table kbq-table>
                <thead>
                    <tr>
                        @for (th of [0, 1, 2, 3]; track $index) {
                            <th>Header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1, 2]; track $index) {
                        <tr [class.kbq-hovered]="$index === 1">
                            @for (td of [0, 1, 2, 3]; track $index) {
                                <td>Cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- last row hovered -->
        <div>
            <table kbq-table>
                <thead>
                    <tr>
                        @for (th of [0, 1, 2, 3]; track $index) {
                            <th>Header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1, 2]; track $index) {
                        <tr [class.kbq-hovered]="$last">
                            @for (td of [0, 1, 2, 3]; track $index) {
                                <td>Cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- border -->
        <div>
            <table kbq-table [border]="true">
                <thead>
                    <tr>
                        @for (th of [0, 1, 2, 3]; track $index) {
                            <th>Header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1, 2]; track $index) {
                        <tr [class.kbq-hovered]="$first">
                            @for (td of [0, 1, 2, 3]; track $index) {
                                <td>Cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- border multiline -->
        <div>
            <table kbq-table [border]="true">
                <thead>
                    <tr>
                        @for (th of [0, 1, 2]; track $index) {
                            <th>Multiline header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1]; track $index) {
                        <tr [class.kbq-hovered]="$first">
                            @for (td of [0, 1, 2]; track $index) {
                                <td>Multiline cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>

        <!-- base multiline -->
        <div>
            <table kbq-table>
                <thead>
                    <tr>
                        @for (th of [0, 1, 2]; track $index) {
                            <th>Multiline header</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (tr of [0, 1]; track $index) {
                        <tr [class.kbq-hovered]="$first">
                            @for (td of [0, 1, 2]; track $index) {
                                <td>Multiline cell</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-xxs);
        }

        table {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTableStates'
    }
})
export class E2eTableStates {}
