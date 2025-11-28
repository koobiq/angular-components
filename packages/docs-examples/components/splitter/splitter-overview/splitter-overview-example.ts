import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Splitter
 */
@Component({
    selector: 'splitter-overview-example',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter>
            <div kbq-splitter-area>first</div>
            <div class="flex" kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `,
    styles: `
        kbq-splitter {
            border: 1px solid black;
            height: 400px;
            margin: 2px;
        }

        div[kbq-splitter-area] {
            background: #c5c0c0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterOverviewExample {}
