import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSkeleton } from '@koobiq/components/skeleton';

/**
 * @title Skeleton animation duration
 */
@Component({
    selector: 'skeleton-animation-duration-example',
    imports: [KbqSkeleton],
    template: `
        <kbq-skeleton class="example-skeleton" animationDuration="3000" />
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .example-skeleton {
            inline-size: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonAnimationDurationExample {}
