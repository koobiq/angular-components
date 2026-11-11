import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Toggle Label Left
 */
@Component({
    selector: 'toggle-label-left-example',
    imports: [KbqToggleModule],
    template: `
        <div class="example-toggle-label-left__container layout-align-center-start layout-column layout-gap-s">
            <kbq-toggle labelPosition="left" [checked]="true">{{ text().tapToWake }}</kbq-toggle>
            <kbq-toggle labelPosition="left">{{ text().shakeToUndo }}</kbq-toggle>
            <kbq-toggle labelPosition="left">{{ text().vibration }}</kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-label-left__container {
            margin-bottom: 28px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-gap-s layout-margin-top-xxl'
    }
})
export class ToggleLabelLeftExample {
    protected readonly text = injectExampleText();
}
