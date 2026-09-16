import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Splitter disabled
 */
@Component({
    selector: 'splitter-disabled-example',
    imports: [KbqSplitter, KbqSplitterPanel, KbqToggleModule],
    template: `
        <kbq-toggle [checked]="disabled()" (change)="disabled.set($event.checked)">disabled</kbq-toggle>

        <kbq-splitter class="example-splitter" [disabled]="disabled()">
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
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        kbq-toggle {
            align-self: center;
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
export class SplitterDisabledExample {
    protected readonly disabled = signal(true);
}
