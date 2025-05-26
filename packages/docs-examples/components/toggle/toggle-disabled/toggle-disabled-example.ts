import { Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Disabled
 */
@Component({
    standalone: true,
    selector: 'toggle-disabled-example',
    imports: [KbqToggleModule],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-toggle [checked]="value()" [disabled]="true" (change)="value.set($event.checked)">Vibration</kbq-toggle>
    `
})
export class ToggleDisabledExample {
    value = signal(false);
}
