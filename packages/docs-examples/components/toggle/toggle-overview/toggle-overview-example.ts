import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

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
    protected readonly text = injectExampleText();

    protected readonly value = signal(false);
}
