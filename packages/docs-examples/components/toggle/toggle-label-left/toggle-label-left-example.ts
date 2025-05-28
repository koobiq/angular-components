import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Label Left
 */
@Component({
    standalone: true,
    selector: 'toggle-label-left-example',
    imports: [KbqToggleModule],
    template: `
        <div class="example-toggle-label-left__container layout-align-center-start layout-column layout-gap-s">
            <kbq-toggle [checked]="true" labelPosition="left">Tap to wake</kbq-toggle>
            <kbq-toggle labelPosition="left">Shake to undo</kbq-toggle>
            <kbq-toggle labelPosition="left">Vibration</kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-label-left__container {
            margin-bottom: 28px;
        }
    `,
    host: {
        class: 'layout-align-center-center layout-row layout-gap-s layout-margin-top-xxl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLabelLeftExample {}
