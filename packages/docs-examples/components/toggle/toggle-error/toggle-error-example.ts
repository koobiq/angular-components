import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Error
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'toggle-error-example',
    imports: [KbqToggleModule],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-toggle [checked]="value()" [color]="color" (change)="value.set($event.checked)">Vibration</kbq-toggle>
    `
})
export class ToggleErrorExample {
    protected readonly value = signal(false);
    protected readonly color = ThemePalette.Error;
}
