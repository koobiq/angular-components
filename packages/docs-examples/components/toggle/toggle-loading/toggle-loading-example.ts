import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqToggleChange, KbqToggleModule } from '@koobiq/components/toggle';
import { timer } from 'rxjs';

/**
 * @title Toggle Loading
 */
@Component({
    standalone: true,
    selector: 'toggle-loading-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="checked()" [loading]="loading" (change)="handleToggle($event)" />
    `,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLoadingExample {
    protected readonly checked = signal(false);
    protected loading = false;

    handleToggle({ checked }: KbqToggleChange) {
        this.loading = true;
        timer(3000).subscribe(() => {
            this.loading = false;
            this.checked.set(checked);
        });
    }
}
