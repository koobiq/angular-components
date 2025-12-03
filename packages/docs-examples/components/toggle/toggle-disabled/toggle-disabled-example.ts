import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Disabled
 */
@Component({
    selector: 'toggle-disabled-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="value()" [disabled]="true" (change)="value.set($event.checked)">Vibration</kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleDisabledExample {
    protected readonly value = signal(false);
}
