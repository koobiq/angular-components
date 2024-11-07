import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Splitter dynamic data
 */
@Component({
    standalone: true,
    selector: 'splitter-dynamic-data-example',
    imports: [
        KbqButtonModule,
        KbqSplitterModule
    ],
    styles: `
        kbq-splitter {
            display: flex;
            border: 1px solid black;
            height: 400px;
            margin: 2px;
        }

        div[kbq-splitter-area] {
            background: #c5c0c0;
        }
    `,
    template: `
        <button
            (click)="isFirstVisible = !isFirstVisible"
            kbq-button
        >
            Change first area visibility
        </button>

        <kbq-splitter>
            @if (isFirstVisible) {
                <div kbq-splitter-area>first</div>
            }
            <div
                class="flex"
                kbq-splitter-area
            >
                second
            </div>
            <div kbq-splitter-area>third</div>
        </kbq-splitter>
    `
})
export class SplitterDynamicDataExample {
    isFirstVisible = true;
}
