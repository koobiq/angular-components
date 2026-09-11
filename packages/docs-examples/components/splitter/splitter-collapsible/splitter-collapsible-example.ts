import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Splitter collapsible panel
 */
@Component({
    selector: 'splitter-collapsible-example',
    imports: [KbqSplitter, KbqSplitterPanel, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="sidebarCollapsed">Sidebar collapsed</kbq-toggle>
        <kbq-toggle [(ngModel)]="terminalCollapsed">Terminal collapsed</kbq-toggle>

        <kbq-splitter class="example-splitter layout-margin-top-l">
            <kbq-splitter-panel minSize="125" size="150" maxSize="200" collapsible [(collapsed)]="sidebarCollapsed">
                <div class="example-splitter-panel-content">
                    Sidebar
                    @if (!sidebarCollapsed()) {
                        <small>Drag left to collapse</small>
                    }
                </div>
            </kbq-splitter-panel>
            <kbq-splitter-panel>
                <kbq-splitter class="example-splitter-nested" orientation="vertical">
                    <kbq-splitter-panel minSize="100">
                        <div class="example-splitter-panel-content">Editor</div>
                    </kbq-splitter-panel>
                    <kbq-splitter-panel
                        size="100"
                        minSize="75"
                        collapsible
                        collapsedSize="30"
                        [(collapsed)]="terminalCollapsed"
                    >
                        <div class="example-splitter-panel-content">
                            Terminal
                            @if (!terminalCollapsed()) {
                                <small>Drag bottom to collapse</small>
                            }
                        </div>
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
            display: flex;
            flex-direction: column;
            flex: 1;
            justify-content: center;
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
export class SplitterCollapsibleExample {
    protected readonly terminalCollapsed = model(false);
    protected readonly sidebarCollapsed = model(false);
}
