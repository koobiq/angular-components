import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton overview
 */
@Component({
    selector: 'skeleton-overview-example',
    imports: [
        KbqSkeleton,
        KbqToggleModule,
        FormsModule,
        KbqAlertModule,
        KbqBadgeModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <div class="example-heading">
            <div class="kbq-title">
                <span [kbqSkeleton]="loading()">Denial-of-service attack</span>
            </div>
            <kbq-badge [badgeColor]="badgeColors.FadeError" [kbqSkeleton]="loading()">Critical</kbq-badge>
        </div>
        <div class="kbq-text-normal">
            <span [kbqSkeleton]="loading()">
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network.
            </span>
        </div>
        <kbq-alert [compact]="true" [kbqSkeleton]="loading()">
            <i aria-hidden="true" kbq-icon="kbq-circle-info_16"></i>
            Protection is enabled on three servers
        </kbq-alert>
        <div class="example-actions">
            <button kbq-button [kbqSkeleton]="loading()">Read more</button>
            <div kbq-button-group>
                <button kbq-button [kbqSkeleton]="loading()">Block</button>
                <button kbq-button [kbqSkeleton]="loading()">Ignore</button>
                <button kbq-button [kbqSkeleton]="loading()">Report</button>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xl);
        }

        .example-heading {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-s);
        }

        .example-actions {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonOverviewExample {
    protected readonly loading = model(true);
    protected readonly badgeColors = KbqBadgeColors;
}
