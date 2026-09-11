import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSplitter, KbqSplitterAppearance, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter appearance
 */
@Component({
    selector: 'splitter-appearance-example',
    imports: [KbqSplitter, KbqSplitterPanel, KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field class="example-form-field">
            <kbq-select [(ngModel)]="appearance">
                @for (appearance of appearances; track appearance) {
                    <kbq-option [value]="appearance">{{ appearance }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

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

        .example-form-field {
            width: 200px;
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
