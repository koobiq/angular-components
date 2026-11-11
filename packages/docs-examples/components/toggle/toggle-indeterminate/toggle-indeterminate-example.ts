import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Toggle Indeterminate
 */
@Component({
    selector: 'toggle-indeterminate-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="checked()" [indeterminate]="indeterminate()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ToggleIndeterminateExample {
    protected readonly text = injectExampleText();

    protected readonly checked = signal(false);
    protected readonly indeterminate = signal(true);
}
