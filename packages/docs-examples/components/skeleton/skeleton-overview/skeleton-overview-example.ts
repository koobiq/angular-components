import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton overview
 */
@Component({
    selector: 'skeleton-overview-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <p>
                <kbq-skeleton [style.width.%]="80" />
                <kbq-skeleton />
                <kbq-skeleton [style.width.%]="60" />
            </p>
        } @else {
            <p class="example-fade-in">
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network.
            </p>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-xl);
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .example-fade-in {
            animation: fadeIn 500ms ease-out;
        }

        p {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xs);
            width: 100%;
            min-height: 100px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonOverviewExample {
    readonly loading = model(true);
}
