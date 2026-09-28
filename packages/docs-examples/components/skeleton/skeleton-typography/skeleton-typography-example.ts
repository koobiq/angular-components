import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with typography
 */
@Component({
    selector: 'skeleton-typography-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <div class="example-typography">
            @for (level of levels; track level) {
                <div class="kbq-{{ level }}">
                    <span [kbqSkeleton]="loading()">{{ level }}</span>
                </div>
            }
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

        .example-typography {
            display: flex;
            flex-direction: column;
            align-self: stretch;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTypographyExample {
    protected readonly loading = model(true);
    protected readonly levels = [
        'display-big',
        'display-big-strong',
        'display-normal',
        'display-normal-strong',
        'display-compact',
        'display-compact-strong',
        'headline',
        'title',
        'subheading',
        'navbar-title',
        'text-big',
        'text-big-medium',
        'text-big-strong',
        'caps-big',
        'caps-big-strong',
        'mono-big',
        'mono-big-strong',
        'tabular-big',
        'tabular-big-strong',
        'italic-big',
        'italic-big-strong',
        'text-normal',
        'text-normal-medium',
        'text-normal-strong',
        'caps-normal',
        'caps-normal-strong',
        'mono-normal',
        'mono-normal-strong',
        'tabular-normal',
        'tabular-normal-strong',
        'italic-normal',
        'italic-normal-strong',
        'text-compact',
        'text-compact-medium',
        'text-compact-strong',
        'caps-compact',
        'caps-compact-strong',
        'mono-compact',
        'mono-compact-strong',
        'tabular-compact',
        'tabular-compact-strong',
        'italic-compact',
        'italic-compact-strong'
    ];
}
