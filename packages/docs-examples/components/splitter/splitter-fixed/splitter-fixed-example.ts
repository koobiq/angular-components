import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Splitter fixed
 */
@Component({
    selector: 'splitter-fixed-example',
    imports: [
        KbqSplitterModule
    ],
    template: `
        <kbq-splitter>
            <div class="kbq-splitter-area_fixed-width" kbq-splitter-area>first (with min-width)</div>
            <div class="flex" kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `,
    styles: `
        kbq-splitter {
            display: flex;
            border: 1px solid black;
            height: 400px;
            margin: 2px;
        }

        .kbq-splitter-area_fixed-width {
            min-width: 200px;
        }

        div[kbq-splitter-area] {
            background: #c5c0c0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterFixedExample {}
