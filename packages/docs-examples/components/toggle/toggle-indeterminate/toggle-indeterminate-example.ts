import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Indeterminate
 */
@Component({
    standalone: true,
    selector: 'toggle-indeterminate-example',
    imports: [KbqToggleModule],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    template: `
        <kbq-toggle [checked]="checked()" [indeterminate]="indeterminate()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleIndeterminateExample {
    protected readonly checked = signal(false);
    protected readonly indeterminate = signal(true);
}
