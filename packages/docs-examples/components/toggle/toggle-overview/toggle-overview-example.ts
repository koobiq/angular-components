import { Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'toggle-overview-example',
    imports: [KbqToggleModule],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-toggle [checked]="value()" (change)="value.set($event.checked)">Wi-Fi</kbq-toggle>
    `
})
export class ToggleOverviewExample {
    protected readonly value = signal(false);
}
