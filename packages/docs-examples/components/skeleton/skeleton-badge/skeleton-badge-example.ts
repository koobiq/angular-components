import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with badges
 */
@Component({
    selector: 'skeleton-badge-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqBadgeModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <div class="example-row">
            <kbq-badge [badgeColor]="colors.FadeTheme" [kbqSkeleton]="loading()">New</kbq-badge>
            <kbq-badge [badgeColor]="colors.FadeSuccess" [kbqSkeleton]="loading()">Active</kbq-badge>
            <kbq-badge [badgeColor]="colors.FadeError" [kbqSkeleton]="loading()">Blocked</kbq-badge>
            <kbq-badge [badgeColor]="colors.Theme" [outline]="true" [kbqSkeleton]="loading()">Beta</kbq-badge>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonBadgeExample {
    protected readonly loading = model(true);

    protected readonly colors = KbqBadgeColors;
}
