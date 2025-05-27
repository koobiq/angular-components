import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Splitter fixed
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'splitter-fixed-example',
    imports: [
        KbqSplitterModule
    ],
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
    template: `
        <kbq-splitter>
            <div class="kbq-splitter-area_fixed-width" kbq-splitter-area>first (with min-width)</div>
            <div class="flex" kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
export class SplitterFixedExample {}
