import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton directive
 */
@Component({
    selector: 'skeleton-directive-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqIconModule, KbqAlertModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-alert [kbqSkeleton]="loading()" [compact]="true">
            <i kbq-icon="kbq-circle-info_16"></i>
            In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to
            make a machine or network resource unavailable to its intended users by temporarily or indefinitely
            disrupting services of a host connected to a network.
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonDirectiveExample {
    readonly loading = model(true);
}
