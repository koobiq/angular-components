import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSkeletonTable } from '@koobiq/components/skeleton';

/**
 * @title Skeleton grid preset
 */
@Component({
    selector: 'skeleton-grid-example',
    imports: [KbqSkeletonTable],
    template: `
        <kbq-skeleton-table selectable [columns]="['240px', 'auto', 'auto', '120px']" [pinnedColumns]="1" />
    `,
    styles: `
        :host {
            display: flex;
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonGridExample {}
