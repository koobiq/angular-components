import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqScrollbarModule } from './scrollbar.module';
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbarOptions } from './scrollbar.types';

type ScrollbarState = {
    state: 'default' | 'disabled' | 'active' | 'hover';
};

@Component({
    selector: 'e2e-scrollbar-state-and-style',
    imports: [
        KbqScrollbarModule
    ],
    template: `
        <div>
            <table data-testid="e2eScrollbarTable">
                @for (row of states; track $index) {
                    <tr>
                        <td>
                            <div
                                class="kbq-scrollbar"
                                style="width: 200px; height: 100px; overflow-y: scroll"
                                [class.kbq-hover]="row.state === 'hover'"
                                [class.kbq-active]="row.state === 'active'"
                            >
                                @for (item of items; track item) {
                                    <div>{{ item }}</div>
                                    <hr style="margin: 2px" />
                                }
                            </div>
                        </td>
                        <td>
                            <div
                                kbq-scrollbar
                                style="width: 200px; height: 100px;"
                                [class.kbq-hover]="row.state === 'hover'"
                                [class.kbq-active]="row.state === 'active'"
                            >
                                @for (item of items; track item) {
                                    <div>{{ item }}</div>
                                    <hr style="margin: 2px" />
                                }
                            </div>
                        </td>
                    </tr>
                }
            </table>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarStateAndStyle'
    },
    providers: [
        {
            provide: KBQ_SCROLLBAR_CONFIG,
            useValue: {
                scrollbars: {
                    autoHide: 'never'
                }
            } satisfies KbqScrollbarOptions
        }
    ]
})
export class E2eScrollbarStateAndStyle {
    readonly items = Array.from({ length: 25 }).map((_, i) => `Item #${i}`);

    readonly states: ScrollbarState[] = [
        { state: 'default' },
        { state: 'hover' },
        { state: 'active' }];
}
