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
        <kbq-toggle [checked]="true" labelPosition="left">Tap to wake</kbq-toggle>
        <kbq-toggle labelPosition="left">Shake to undo</kbq-toggle>
        <kbq-toggle labelPosition="left">Vibration</kbq-toggle>
    `,
    styles: `
        :host {
            margin-bottom: 28px;
            justify-self: center;
        }
    `,
    host: {
        class: 'layout-align-center-start layout-column layout-gap-s layout-margin-top-xxl'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLabelLeftExample {}
