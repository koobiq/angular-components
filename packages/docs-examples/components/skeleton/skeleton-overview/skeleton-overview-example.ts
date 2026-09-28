import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton overview
 */
@Component({
    selector: 'skeleton-overview-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqButtonModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <div class="kbq-title">
            <span [kbqSkeleton]="loading()">Denial-of-service attack</span>
        </div>
        <div class="kbq-text-normal">
            <span [kbqSkeleton]="loading()">
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network.
            </span>
        </div>
        <button kbq-button [kbqSkeleton]="loading()">Read more</button>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonOverviewExample {
    protected readonly loading = model(true);
}
