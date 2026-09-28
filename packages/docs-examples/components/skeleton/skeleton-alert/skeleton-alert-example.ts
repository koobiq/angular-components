import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with alerts
 */
@Component({
    selector: 'skeleton-alert-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqAlertModule, KbqIconModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-alert class="example-alert" [kbqSkeleton]="loading()">
            <i aria-hidden="true" kbq-icon="kbq-circle-info_16"></i>
            <div kbq-alert-title>Synchronization</div>
            Synchronization with the directory service takes a few minutes. The list of users updates when it is over.
        </kbq-alert>

        <kbq-alert
            class="example-alert"
            [alertColor]="alertColors.Error"
            [alertStyle]="alertStyles.Colored"
            [compact]="true"
            [kbqSkeleton]="loading()"
        >
            <i aria-hidden="true" kbq-icon="kbq-triangle-exclamation_16"></i>
            The server did not respond
        </kbq-alert>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-alert {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonAlertExample {
    protected readonly loading = model(true);

    protected readonly alertColors = KbqAlertColors;
    protected readonly alertStyles = KbqAlertStyles;
}
