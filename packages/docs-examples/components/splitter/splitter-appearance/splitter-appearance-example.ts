import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqSplitter, KbqSplitterAppearance, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter appearance
 */
@Component({
    selector: 'splitter-appearance-example',
    imports: [KbqSplitter, KbqSplitterPanel, KbqButtonToggleModule, FormsModule],
    template: `
        <kbq-button-toggle-group class="example-toggle-group" [(ngModel)]="appearance">
            @for (appearance of appearances; track appearance) {
                <kbq-button-toggle [value]="appearance">{{ appearance }}</kbq-button-toggle>
            }
        </kbq-button-toggle-group>

        <kbq-splitter class="example-splitter" [appearance]="appearance()">
            <kbq-splitter-panel minSize="125">
                <div class="example-splitter-panel-content layout-margin-right-s">Panel 1</div>
            </kbq-splitter-panel>
            <kbq-splitter-panel minSize="125">
                <div class="example-splitter-panel-content layout-margin-left-s">Panel 2</div>
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

        .example-toggle-group {
            align-self: center;
        }

        .example-splitter {
            height: 200px;
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
            background-color: var(--kbq-background-bg-secondary);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterAppearanceExample {
    protected readonly appearances: KbqSplitterAppearance[] = ['divider', 'transparent', 'handle'];
    protected readonly appearance = model<KbqSplitterAppearance>('handle');
}
