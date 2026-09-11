import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSplitter, KbqSplitterOrientation, KbqSplitterPanel } from '@koobiq/components/splitter';

/**
 * @title Splitter orientation
 */
@Component({
    selector: 'splitter-orientation-example',
    imports: [KbqSplitter, KbqSplitterPanel, KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field class="example-form-field">
            <kbq-select [(ngModel)]="orientation">
                @for (orientation of orientations; track orientation) {
                    <kbq-option [value]="orientation">{{ orientation }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-splitter class="example-splitter" [orientation]="orientation()">
            <kbq-splitter-panel minSize="70">
                <div class="example-splitter-panel-content">Panel 1</div>
            </kbq-splitter-panel>
            <kbq-splitter-panel minSize="70">
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

        .example-form-field {
            width: 200px;
            align-self: center;
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitterOrientationExample {
    protected readonly orientations: KbqSplitterOrientation[] = ['horizontal', 'vertical'];
    protected readonly orientation = model<KbqSplitterOrientation>('vertical');
}
