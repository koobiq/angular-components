import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { timer } from 'rxjs';
import { type KbqToggleChange, KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Loading
 */
@Component({
    selector: 'toggle-loading-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="checked()" [loading]="loading" (change)="handleToggle($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    }
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
