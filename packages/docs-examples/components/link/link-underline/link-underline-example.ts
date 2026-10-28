import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqLink, KbqLinkUnderline } from '@koobiq/components/link';

/**
 * @title Link underline
 */
@Component({
    selector: 'link-underline-example',
    imports: [KbqLink, KbqButtonToggleModule, FormsModule],
    template: `
        <kbq-button-toggle-group [(ngModel)]="underline">
            <kbq-button-toggle value="always">Always</kbq-button-toggle>
            <kbq-button-toggle value="hover">Hover</kbq-button-toggle>
            <kbq-button-toggle value="none">None</kbq-button-toggle>
        </kbq-button-toggle-group>

        <div class="example-stage">
            <a kbqLink href="https://koobiq.io/en/components/link" target="_blank" [underline]="underline()">
                Scan report
            </a>
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
export class LinkUnderlineExample {
    readonly underline = model<KbqLinkUnderline>('always');
}
