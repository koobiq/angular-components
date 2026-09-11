import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter constraints
 */
@Component({
    selector: 'splitter-constraints-example',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter class="example-splitter" appearance="transparent">
            <kbq-splitter-panel minSize="125">
                <div class="example-splitter-panel-content layout-margin-right-s">
                    Panel 1
                    <small>min: 125px</small>
                </div>
            </kbq-splitter-panel>
            <kbq-splitter-panel size="30%" minSize="20%" maxSize="40%">
                <div class="example-splitter-panel-content layout-margin-left-s layout-margin-right-s">
                    Panel 2
                    <small>size: 30%</small>
                    <small>min: 20%, max: 40%</small>
                </div>
            </kbq-splitter-panel>
            <kbq-splitter-panel minSize="125">
                <div class="example-splitter-panel-content layout-margin-left-s">
                    Panel 3
                    <small>min: 125px</small>
                </div>
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
        }

        .example-splitter-panel-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-content: center;
            justify-content: center;
            text-align: center;
            user-select: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--kbq-foreground-contrast-secondary);
            background-color: var(--kbq-background-bg-secondary);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterConstraintsExample {}
