import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Basic Splitter
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'splitter-vertical-example',
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

        .kbq-splitter-area_fixed-height {
            min-height: 100px;
        }

        div[kbq-splitter-area] {
            background: #c5c0c0;
        }
    `,
    template: `
        <kbq-splitter [direction]="direction.Vertical">
            <div class="kbq-splitter-area_fixed-height" kbq-splitter-area>first (with min-height)</div>
            <div class="flex" kbq-splitter-area>second</div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
export class SplitterVerticalExample {
    direction = Direction;
}
