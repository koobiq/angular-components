import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Component representing a skeleton placeholder.
 */
@Component({
    selector: 'kbq-skeleton',
    template: '',
    styleUrl: 'skeleton.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-skeleton'
    },
    exportAs: 'kbqSkeleton'
})
export class KbqSkeleton {}
