import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';

/** A button whose label follows a signal: proves the package renders and updates in the configuration. */
@Component({
    selector: 'check-smoke',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="clicks.set(clicks() + 1)">Clicked {{ clicks() }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmokeScenario {
    readonly clicks = signal(0);
}
