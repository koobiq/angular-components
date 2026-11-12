import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle
 */
@Component({
    selector: 'toggle-overview-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="value()" (change)="value.set($event.checked)">Wi-Fi</kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleOverviewExample {
    protected readonly value = signal(false);
}
