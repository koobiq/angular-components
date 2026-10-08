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
            <div class="example-content">
                <kbq-skeleton-typography class="example-overline" level="caps-compact" />
                <kbq-skeleton-typography class="example-title" level="title" />
                <kbq-skeleton-typography class="example-body" [lines]="4" />
                <kbq-skeleton-typography class="example-caption" level="text-compact" />
            </div>
        } @else {
            <div class="example-content">
                <div class="kbq-caps-compact example-secondary example-overline">Threat intelligence</div>
                <div class="kbq-title example-title">Denial-of-service attack</div>
                <div class="kbq-text-normal example-body">
                    In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator
                    seeks to make a machine or network resource unavailable to its intended users by temporarily or
                    indefinitely disrupting services of a host connected to a network.
                </div>
                <div class="kbq-text-compact example-secondary example-caption">
                    Updated two hours ago by the security team
                </div>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-xl);
        }

        .example-content {
            display: flex;
            flex-direction: column;
        }

        .example-overline {
            margin-block-end: var(--kbq-size-xxs);
        }

        .example-title {
            margin-block-end: var(--kbq-size-s);
        }

        .example-body {
            margin-block-end: var(--kbq-size-m);
        }

        .example-caption {
            margin-block-end: 0;
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
