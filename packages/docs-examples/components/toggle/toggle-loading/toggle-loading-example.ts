import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqOnToggleHandler, KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle Loading
 */
@Component({
    standalone: true,
    selector: 'toggle-loading-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="checked()" [onToggle]="onToggle" (change)="checked.set($event.checked)" />
    `,
    host: {
        class: 'layout-row layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleLoadingExample {
    protected readonly checked = signal(false);
    protected onToggle: KbqOnToggleHandler = () =>
        new Promise((resolve) => {
            setTimeout(() => resolve(), 3000);
        });
}
