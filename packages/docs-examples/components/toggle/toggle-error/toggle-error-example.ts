import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Error
 */
@Component({
    selector: 'toggle-error-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="value()" [color]="color" (change)="value.set($event.checked)">Vibration</kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleErrorExample {
    protected readonly value = signal(false);
    protected readonly color = ThemePalette.Error;
}
