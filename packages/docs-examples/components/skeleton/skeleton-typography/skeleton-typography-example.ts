import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTypography } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton typography preset
 */
@Component({
    selector: 'skeleton-typography-example',
    imports: [KbqSkeletonTypography, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-typography level="caps-compact" />
            <kbq-skeleton-typography level="title" />
            <kbq-skeleton-typography [lines]="4" />
            <kbq-skeleton-typography level="text-compact" />
        } @else {
            <div class="kbq-caps-compact example-secondary">Threat intelligence</div>
            <div class="kbq-title">Denial-of-service attack</div>
            <div class="kbq-text-normal">
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network.
            </div>
            <div class="kbq-text-compact example-secondary">Updated two hours ago by the security team</div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xl);
        }

        .example-secondary {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTypographyExample {
    protected readonly loading = model(true);
}
