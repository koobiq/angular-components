import { Component } from '@angular/core';
import { Direction, KbqSplitterModule } from '@koobiq/components/splitter';

/**
 * @title Splitter nested
 */
@Component({
    standalone: true,
    selector: 'splitter-nested-example',
    imports: [
        KbqSplitterModule
    ],
    styles: `
        :host {
            kbq-splitter.with-border {
                border: 1px solid black;
                height: 300px;
                margin: 2px;
            }

            kbq-splitter.without-border {
                height: 300px;
            }

            .with-border > div[kbq-splitter-area] {
                background: #c5c0c0;
            }

            .without-border > div[kbq-splitter-area] {
                background: #b3b3b3;
            }

            .nested-splitter > div[kbq-splitter-area] {
                background: #9f9f9f;
            }
        }
    `,
    template: `
        <kbq-splitter class="with-border">
            <div kbq-splitter-area>left</div>
            <div
                class="flex"
                kbq-splitter-area
            >
                <kbq-splitter
                    class="without-border flex"
                    [direction]="direction.Vertical"
                >
                    <div kbq-splitter-area>top</div>
                    <div
                        class="layout-column flex"
                        kbq-splitter-area
                    >
                        <kbq-splitter class="flex nested-splitter">
                            <div kbq-splitter-area>center-left</div>
                            <div
                                class="flex"
                                kbq-splitter-area
                            >
                                center
                            </div>
                            <div kbq-splitter-area>center-right</div>
                        </kbq-splitter>
                    </div>
                    <div kbq-splitter-area>bottom</div>
                </kbq-splitter>
            </div>
            <div kbq-splitter-area>right</div>
        </kbq-splitter>
    `
})
export class SplitterNestedExample {
    direction = Direction;
}
