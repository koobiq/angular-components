import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { injectExampleText } from '../l10n';

/**
 * @title Skeleton basic block
 */
@Component({
    selector: 'skeleton-basic-example',
    imports: [KbqSkeleton],
    template: `
        <kbq-skeleton class="example-skeleton" />
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
export class SkeletonBasicExample {
    protected readonly text = injectExampleText();
}
