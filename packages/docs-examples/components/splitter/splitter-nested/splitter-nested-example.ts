import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter nested
 */
@Component({
    selector: 'splitter-nested-example',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter class="example-splitter">
            <kbq-splitter-panel maxSize="200">
                <div class="example-splitter-panel-content">Sidebar</div>
            </kbq-splitter-panel>
            <kbq-splitter-panel>
                <kbq-splitter class="example-splitter-nested" orientation="vertical">
                    <kbq-splitter-panel minSize="100">
                        <kbq-splitter class="example-splitter-nested">
                            <kbq-splitter-panel minSize="100">
                                <div class="example-splitter-panel-content">Editor 1</div>
                            </kbq-splitter-panel>
                            <kbq-splitter-panel minSize="100">
                                <div class="example-splitter-panel-content">Editor 2</div>
                            </kbq-splitter-panel>
                        </kbq-splitter>
                    </kbq-splitter-panel>
                    <kbq-splitter-panel size="50">
                        <div class="example-splitter-panel-content">Terminal</div>
                    </kbq-splitter-panel>
                </kbq-splitter>
            </kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            padding: var(--kbq-size-l);
        }

        .example-splitter {
            height: 300px;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
        }

        .example-splitter-panel-content {
            flex: 1;
            align-content: center;
            text-align: center;
            user-select: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--kbq-foreground-contrast-secondary);
        }

        .example-splitter-nested {
            flex: 1;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterNestedExample {}
