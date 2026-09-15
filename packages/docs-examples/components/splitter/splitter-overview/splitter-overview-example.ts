import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter overview
 */
@Component({
    selector: 'splitter-overview-example',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter class="example-splitter">
            <kbq-splitter-panel minSize="100">
                <div class="example-splitter-panel-content">Panel 1</div>
            </kbq-splitter-panel>
            <kbq-splitter-panel minSize="100">
                <div class="example-splitter-panel-content">Panel 2</div>
            </kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-l);
        }

        .example-splitter {
            height: 200px;
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterOverviewExample {}
