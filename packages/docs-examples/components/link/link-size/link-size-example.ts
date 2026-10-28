import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link size
 */
@Component({
    selector: 'link-size-example',
    imports: [KbqLink, KbqButtonToggleModule, FormsModule],
    template: `
        <kbq-button-toggle-group [(ngModel)]="size">
            <kbq-button-toggle value="compact">Compact</kbq-button-toggle>
            <kbq-button-toggle value="normal">Normal</kbq-button-toggle>
            <kbq-button-toggle value="big">Big</kbq-button-toggle>
        </kbq-button-toggle-group>

        <div class="example-stage">
            <a kbqLink href="https://koobiq.io/en/components/link" target="_blank" [size]="size()">Scan report</a>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .example-stage {
            display: flex;
            align-items: center;
            min-height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkSizeExample {
    readonly size = model<KbqDefaultSizes>('normal');
}
